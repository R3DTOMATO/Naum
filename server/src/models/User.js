const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true},
    email:{
        type:String,
        required: true,
        unique: true},
    password:{
        type: String,
        required: true},
    nickname: {
        type: String,
        default: function() { return this.username; }
    },
    profileImg: {
        type: String,
        default: '/default-profile.svg'
    },
    bio: {
        type: String,
        default: ''
    },
    // 친구 관계 (양방향 - 요청 시스템)
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // 받은 친구 요청
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    // 보낸 친구 요청
    sentFriendRequests: [{
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    // 팔로우 관계 (일방향)
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    date:{
        type: Date,
        default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);