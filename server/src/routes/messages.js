const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/Auth');

// 메시지 보내기
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.userId;
        
        if (!receiverId || !content) {
            return res.status(400).json({ message: '수신자와 메시지 내용이 필요합니다.' });
        }
        
        if (receiverId === senderId) {
            return res.status(400).json({ message: '자신에게는 메시지를 보낼 수 없습니다.' });
        }
        
        // 친구인지 확인
        const sender = await User.findById(senderId);
        const isFriend = sender.friends.includes(receiverId);
        
        if (!isFriend) {
            return res.status(403).json({ message: '친구한테만 메시지를 보낼 수 있습니다.' });
        }
        
        // 수신자가 존재하는지 확인
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: '수신자를 찾을 수 없습니다.' });
        }
        
        // 대화 ID 생성
        const conversationId = Message.generateConversationId(senderId, receiverId);
        
        // 메시지 생성
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            conversationId
        });
        
        await message.save();
        
        // populate해서 반환
        await message.populate([
            { path: 'sender', select: 'username nickname profileImg' },
            { path: 'receiver', select: 'username nickname profileImg' }
        ]);
        
        res.status(201).json(message);
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 대화 목록 가져오기
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        // 사용자가 참여한 모든 대화의 최신 메시지들 가져오기
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { receiver: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    lastMessageTime: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lastMessage.sender',
                    foreignField: '_id',
                    as: 'senderInfo'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lastMessage.receiver',
                    foreignField: '_id',
                    as: 'receiverInfo'
                }
            }
        ]);
        
        // 대화 상대방 정보 추가
        const conversationsWithPartner = conversations.map(conv => {
            const senderInfo = conv.senderInfo[0];
            const receiverInfo = conv.receiverInfo[0];
            const lastMessage = conv.lastMessage;
            
            // 대화 상대방 결정
            const isFromMe = lastMessage.sender.toString() === userId;
            const partner = isFromMe ? {
                _id: receiverInfo._id,
                username: receiverInfo.username,
                nickname: receiverInfo.nickname,
                profileImg: receiverInfo.profileImg
            } : {
                _id: senderInfo._id,
                username: senderInfo.username,
                nickname: senderInfo.nickname,
                profileImg: senderInfo.profileImg
            };
            
            return {
                conversationId: conv._id,
                partner,
                lastMessage: {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isFromMe
                },
                unreadCount: conv.unreadCount,
                lastMessageTime: conv.lastMessageTime
            };
        });
        
        res.json(conversationsWithPartner);
    } catch (error) {
        console.error('대화 목록 조회 오류:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 특정 대화의 메시지 목록 가져오기
router.get('/conversation/:partnerId', auth, async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // 친구인지 확인
        const user = await User.findById(userId);
        if (!user.friends.includes(partnerId)) {
            return res.status(403).json({ message: '친구한테만 메시지를 확인할 수 있습니다.' });
        }
        
        const conversationId = Message.generateConversationId(userId, partnerId);
        
        const messages = await Message.find({ conversationId })
            .populate('sender', 'username nickname profileImg')
            .populate('receiver', 'username nickname profileImg')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        
        // 메시지를 시간 순으로 정렬 (오래된 것부터)
        messages.reverse();
        
        res.json(messages);
    } catch (error) {
        console.error('메시지 목록 조회 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 메시지 읽음 표시
router.put('/read/:partnerId', auth, async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.userId;
        
        const conversationId = Message.generateConversationId(userId, partnerId);
        
        // 해당 대화에서 내가 받은 읽지 않은 메시지들을 읽음으로 표시
        await Message.updateMany(
            {
                conversationId,
                receiver: userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );
        
        res.json({ message: '메시지를 읽음으로 표시했습니다.' });
    } catch (error) {
        console.error('메시지 읽음 표시 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 읽지 않은 메시지 총 개수
router.get('/unread-count', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        const unreadCount = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });
        
        res.json({ unreadCount });
    } catch (error) {
        console.error('읽지 않은 메시지 개수 조회 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 메시지 삭제 (본인이 보낸 메시지만)
router.delete('/:messageId', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userId;
        
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
        }
        
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: '본인이 보낸 메시지만 삭제할 수 있습니다.' });
        }
        
        await Message.findByIdAndDelete(messageId);
        
        res.json({ message: '메시지가 삭제되었습니다.' });
    } catch (error) {
        console.error('메시지 삭제 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;