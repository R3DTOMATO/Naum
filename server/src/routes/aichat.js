const express = require('express');
const router = express.Router();
const AiChat = require('../models/AiChat');
const auth = require('../middleware/Auth');
const User = require('../models/User');
const { Configuration, OpenAIApi } = require('openai');

// AI 챗 메시지 보내기
router.post('/send', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.userId;
        if (!content) {
            return res.status(400).json({ message: '메시지 내용이 필요합니다.' });
        }
        // OpenAI API 설정
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        // AI 챗 메시지 저장
        let aiChat = await AiChat.findOne({ user: userId });
        if (!aiChat) {
            aiChat = new AiChat({ user: userId, messages: [] });
        }
        aiChat.messages.push({ role: 'user', content });
        await aiChat.save();
        // OpenAI API 호출
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: aiChat.messages.map(msg => ({ role: msg.role, content: msg.content })),
        });
        const aiResponse = response.data.choices[0].message.content;
        // AI 응답 저장
        aiChat.messages.push({ role: 'assistant', content: aiResponse });
        await aiChat.save();
        res.status(200).json({ message: aiResponse });
    } catch (error) {
        console.error('AI 챗 메시지 전송 오류:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;