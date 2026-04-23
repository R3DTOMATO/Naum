const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    conversationId: {
        type: String,
        required: true,
        // 두 사용자 ID를 정렬해서 조합 (예: userId1_userId2)
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 대화 ID 생성 헬퍼 함수
MessageSchema.statics.generateConversationId = function(userId1, userId2) {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
};

// 인덱스 생성
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);