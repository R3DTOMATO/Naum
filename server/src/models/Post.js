const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    reactions: {
        happy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        sad: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        angry: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        fear: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        surprise: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);