const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //check if user already exists
        const isExistingUser = await User.findOne({ email });
        if(isExistingUser) return res.status(400).json({ message: 'Email already exists' });

        //generate new password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        //check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        //check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        //create and assign a token
        const token = jwt.sign({ id: user._id, email: user.email, username: user.username}, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(200).json({ 
            token, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                bio: user.bio,
                profileImg: user.profileImg,
                date: user.date
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET USER PROFILE (PROTECTED ROUTE)
router.get('/me', require('../middleware/Auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // 로그인 응답과 동일한 형태로 반환
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            bio: user.bio,
            profileImg: user.profileImg,
            date: user.date
        });
    } catch (err) {
        console.error('Auth me error:', err);
        res.status(500).json({ message: err.message });
    }
});

// LOGOUT (클라이언트에서 토큰 삭제하면 됨)
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;