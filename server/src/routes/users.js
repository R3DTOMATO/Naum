const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/Auth');

// ============== 친구 관련 라우트 (구체적인 라우트를 먼저 정의) ==============

// 친구 요청 보내기
router.post('/friend-request/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const senderId = req.userId;
        
        if (userId === senderId) {
            return res.status(400).json({ message: '자신에게 친구 요청을 보낼 수 없습니다.' });
        }
        
        // 이미 친구인지 확인
        const sender = await User.findById(senderId);
        if (!sender.friends) {
            sender.friends = [];
            await sender.save();
        }
        if (!sender.sentFriendRequests) {
            sender.sentFriendRequests = [];
            await sender.save();
        }
        
        if (sender.friends.includes(userId)) {
            return res.status(400).json({ message: '이미 친구입니다.' });
        }
        
        // 이미 요청이 있는지 확인
        if (sender.sentFriendRequests.some(req => req.to.toString() === userId)) {
            return res.status(400).json({ message: '이미 친구 요청을 보냈습니다.' });
        }
        
        // 받는 사람의 필드 초기화
        const receiver = await User.findById(userId);
        if (!receiver.friendRequests) {
            receiver.friendRequests = [];
            await receiver.save();
        }
        
        // 받는 사람에게 친구 요청 추가
        await User.findByIdAndUpdate(userId, {
            $push: { friendRequests: { from: senderId } }
        });
        
        // 보낸 사람의 요청 목록에 추가
        await User.findByIdAndUpdate(senderId, {
            $push: { sentFriendRequests: { to: userId } }
        });
        
        res.json({ message: '친구 요청을 보냈습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 친구 요청 수락
router.post('/friend-request/accept/:senderId', auth, async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.userId;
        
        // 두 사용자의 필드 초기화 확인
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);
        
        if (!receiver.friendRequests) {
            receiver.friendRequests = [];
            await receiver.save();
        }
        if (!receiver.friends) {
            receiver.friends = [];
            await receiver.save();
        }
        if (!sender.sentFriendRequests) {
            sender.sentFriendRequests = [];
            await sender.save();
        }
        if (!sender.friends) {
            sender.friends = [];
            await sender.save();
        }
        
        // 양쪽 사용자에게 친구 추가
        await User.findByIdAndUpdate(receiverId, {
            $pull: { friendRequests: { from: senderId } },
            $push: { friends: senderId }
        });
        
        await User.findByIdAndUpdate(senderId, {
            $pull: { sentFriendRequests: { to: receiverId } },
            $push: { friends: receiverId }
        });
        
        res.json({ message: '친구 요청을 수락했습니다.' });
    } catch (error) {
        console.error('친구 요청 수락 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 친구 요청 거부
router.post('/friend-request/reject/:senderId', auth, async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.userId;
        
        // 두 사용자의 필드 초기화 확인
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);
        
        if (!receiver.friendRequests) {
            receiver.friendRequests = [];
            await receiver.save();
        }
        if (!sender.sentFriendRequests) {
            sender.sentFriendRequests = [];
            await sender.save();
        }
        
        // 요청만 제거
        await User.findByIdAndUpdate(receiverId, {
            $pull: { friendRequests: { from: senderId } }
        });
        
        await User.findByIdAndUpdate(senderId, {
            $pull: { sentFriendRequests: { to: receiverId } }
        });
        
        res.json({ message: '친구 요청을 거부했습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 친구 삭제
router.delete('/friend/:friendId', auth, async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.userId;
        
        // 양쪽 사용자의 친구 목록에서 제거
        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        });
        
        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        });
        
        res.json({ message: '친구를 삭제했습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 받은 친구 요청 목록 조회
router.get('/friend-requests/received', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: 'friendRequests.from',
                select: 'username nickname profileImg'
            });
        
        res.json(user.friendRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 보낸 친구 요청 목록 조회
router.get('/friend-requests/sent', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: 'sentFriendRequests.to',
                select: 'username nickname profileImg'
            });
        
        res.json(user.sentFriendRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 친구 목록 조회
router.get('/friends', auth, async (req, res) => {
    try {
        console.log('친구 목록 조회 요청:', req.userId); // 디버깅용 로그
        
        const user = await User.findById(req.userId)
            .populate('friends', 'username nickname profileImg');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // friends 필드가 없는 경우 빈 배열로 초기화
        if (!user.friends) {
            user.friends = [];
            await user.save();
        }
        
        console.log('친구 목록:', user.friends); // 디버깅용 로그
        res.json(user.friends || []);
    } catch (error) {
        console.error('친구 목록 조회 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============== 팔로우 관련 라우트 ==============

// 팔로워 목록 조회
router.get('/followers', auth, async (req, res) => {
    try {
        console.log('팔로워 목록 조회 요청:', req.userId); // 디버깅용 로그
        
        const user = await User.findById(req.userId)
            .populate('followers', 'username nickname profileImg');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // followers 필드가 없는 경우 빈 배열로 초기화
        if (!user.followers) {
            user.followers = [];
            await user.save();
        }
        
        console.log('팔로워 목록:', user.followers); // 디버깅용 로그
        res.json(user.followers || []);
    } catch (error) {
        console.error('팔로워 목록 조회 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 팔로잉 목록 조회
router.get('/following', auth, async (req, res) => {
    try {
        console.log('팔로잉 목록 조회 요청:', req.userId); // 디버깅용 로그
        
        const user = await User.findById(req.userId)
            .populate('following', 'username nickname profileImg');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // following 필드가 없는 경우 빈 배열로 초기화
        if (!user.following) {
            user.following = [];
            await user.save();
        }
        
        console.log('팔로잉 목록:', user.following); // 디버깅용 로그
        res.json(user.following || []);
    } catch (error) {
        console.error('팔로잉 목록 조회 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 팔로우
router.post('/follow/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.userId;
        
        if (userId === followerId) {
            return res.status(400).json({ message: '자신을 팔로우할 수 없습니다.' });
        }
        
        // 두 사용자의 필드 초기화
        const follower = await User.findById(followerId);
        const target = await User.findById(userId);
        
        if (!follower.following) {
            follower.following = [];
            await follower.save();
        }
        if (!target.followers) {
            target.followers = [];
            await target.save();
        }
        
        if (follower.following.includes(userId)) {
            return res.status(400).json({ message: '이미 팔로우 중입니다.' });
        }
        
        // 팔로우 추가
        await User.findByIdAndUpdate(followerId, {
            $push: { following: userId }
        });
        
        await User.findByIdAndUpdate(userId, {
            $push: { followers: followerId }
        });
        
        res.json({ message: '팔로우를 시작했습니다.' });
    } catch (error) {
        console.error('팔로우 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 언팔로우
router.post('/unfollow/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.userId;
        
        // 두 사용자의 필드 초기화
        const follower = await User.findById(followerId);
        const target = await User.findById(userId);
        
        if (!follower.following) {
            follower.following = [];
            await follower.save();
        }
        if (!target.followers) {
            target.followers = [];
            await target.save();
        }
        
        // 언팔로우
        await User.findByIdAndUpdate(followerId, {
            $pull: { following: userId }
        });
        
        await User.findByIdAndUpdate(userId, {
            $pull: { followers: followerId }
        });
        
        res.json({ message: '언팔로우했습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============== 프로필 관련 라우트 ==============

// 프로필 업데이트
router.put('/profile', auth, async (req, res) => {
    try {
        const { nickname, bio, profileImg } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // 업데이트할 필드들
        const updateFields = {};
        if (nickname !== undefined) updateFields.nickname = nickname;
        if (bio !== undefined) updateFields.bio = bio;
        if (profileImg !== undefined) updateFields.profileImg = profileImg;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============== 특정 사용자 조회 (파라미터 라우트는 마지막에 정의) ==============

// 특정 사용자 정보 조회
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        // ObjectId 형식 검증
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('friends', 'username nickname profileImg')
            .populate('followers', 'username nickname profileImg')
            .populate('following', 'username nickname profileImg');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // 필드가 없는 경우 빈 배열로 초기화
        const userData = {
            ...user.toObject(),
            friends: user.friends || [],
            followers: user.followers || [],
            following: user.following || [],
            friendRequests: user.friendRequests || [],
            sentFriendRequests: user.sentFriendRequests || []
        };
        
        res.json(userData);
    } catch (error) {
        console.error('User lookup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;