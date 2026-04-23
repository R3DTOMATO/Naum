const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');

const app = express();

//middleware
// CORS 설정을 먼저 적용
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// uploads 폴더 정적 서빙
const path = require('path');
const uploadsPath = path.join(__dirname, '../../uploads');
console.log('Static files serving from:', uploadsPath);
app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', req.path);
  next();
}, express.static(uploadsPath));

// JSON body parser with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

//connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // uploads 폴더 존재 확인
    const fs = require('fs');
    const uploadsPath = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsPath)) {
        console.log('✅ Uploads folder exists at:', uploadsPath);
        const files = fs.readdirSync(uploadsPath);
        console.log('📁 Files in uploads:', files);
    } else {
        console.log('❌ Uploads folder does not exist at:', uploadsPath);
        // uploads 폴더 자동 생성
        try {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('✅ Created uploads folder at:', uploadsPath);
        } catch (err) {
            console.error('❌ Failed to create uploads folder:', err);
        }
    }
});