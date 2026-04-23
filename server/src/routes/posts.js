const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/Auth');

// 모든 게시물 조회 (최신순)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'username nickname profileImg')
            .sort({ createdAt: -1 });
        
        // 댓글 수 추가
        const postsWithCommentCount = posts.map(post => {
            const postObj = post.toObject();
            postObj.commentsCount = post.comments ? post.comments.length : 0;
            return postObj;
        });
        
        res.json(postsWithCommentCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 특정 게시물 조회
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId)
            .populate('userId', 'username nickname profileImg');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // 댓글 수 추가
        const postObj = post.toObject();
        postObj.commentsCount = post.comments ? post.comments.length : 0;
        
        res.json(postObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 특정 사용자의 게시물 조회
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        // ObjectId 형식 검증
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const posts = await Post.find({ userId })
            .populate('userId', 'username nickname profileImg')
            .sort({ createdAt: -1 });
        
        // 댓글 수 추가
        const postsWithCommentCount = posts.map(post => {
            const postObj = post.toObject();
            postObj.commentsCount = post.comments ? post.comments.length : 0;
            return postObj;
        });
        
        res.json(postsWithCommentCount);
    } catch (error) {
        console.error('User posts lookup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 게시물 생성
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const newPost = new Post({
            title,
            content,
            imageUrl: imageUrl || null,
            userId: req.userId,
            username: user.username
        });
        
        const savedPost = await newPost.save();
        await savedPost.populate('userId', 'username');
        
        res.status(201).json(savedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 게시물 감정 반응 토글
router.post('/:postId/emotion', auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { emotion } = req.body; // 'happy', 'sad', 'angry', 'fear', 'surprise'
        const userId = req.userId;
        
        // 유효한 감정인지 확인
        const validEmotions = ['happy', 'sad', 'angry', 'fear', 'surprise'];
        if (!validEmotions.includes(emotion)) {
            return res.status(400).json({ message: 'Invalid emotion type' });
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // 기존에 이 감정으로 반응했는지 확인
        const hasReacted = post.reactions[emotion].includes(userId);
        
        if (hasReacted) {
            // 이미 반응했으면 제거 (토글)
            post.reactions[emotion] = post.reactions[emotion].filter(id => id.toString() !== userId);
        } else {
            // 다른 감정들에서 이 유저의 반응 제거 (한 명당 하나의 감정만 가능)
            validEmotions.forEach(emotionType => {
                if (emotionType !== emotion) {
                    post.reactions[emotionType] = post.reactions[emotionType].filter(id => id.toString() !== userId);
                }
            });
            // 새 감정 추가
            post.reactions[emotion].push(userId);
        }
        
        await post.save();
        
        // 각 감정별 카운트 반환
        const emotionCounts = {};
        validEmotions.forEach(emotionType => {
            emotionCounts[emotionType] = post.reactions[emotionType].length;
        });
        
        res.json({ 
            emotionCounts,
            userEmotion: hasReacted ? null : emotion // 현재 유저의 감정 상태
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 댓글 추가
router.post('/:postId/comments', auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const newComment = {
            userId: req.userId,
            username: user.username,
            content
        };
        
        post.comments.push(newComment);
        await post.save();
        
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 특정 게시물의 댓글 조회
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(post.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;