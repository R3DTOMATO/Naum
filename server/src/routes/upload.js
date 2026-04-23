const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/Auth');
const User = require('../models/User');

const router = express.Router();

// uploads 폴더에 저장
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    console.log('Upload destination:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${req.userId}_${Date.now()}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 프로필 이미지 업로드
router.post('/profile', auth, upload.single('profileImg'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('Profile image uploaded:', imageUrl);
    
    // DB에 이미지 URL 저장
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImg: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json({ imageUrl, user });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 게시물 이미지 업로드
router.post('/post', auth, upload.single('postImg'), async (req, res) => {
  try {
    console.log('Post image upload request received');
    console.log('File info:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);
    console.log('File saved at:', req.file.path);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Post image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
