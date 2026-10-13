const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { JWT_SECRET } = require('../middlewares/auth');

async function register(req, res) {
  try {
    const { name, email, password, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        goal: goal || 'Zero-foundation',
        role: 'STUDENT',
        level: 'A1',
        xp: 0,
        streakDays: 1,
        lastStudyDate: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        goal: true,
        xp: true,
        practiceScore: true,
        streakDays: true,
        placementStatus: true,
        placementScore: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký tài khoản.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Check streak
    let currentStreak = user.streakDays;
    const now = new Date();
    if (user.lastStudyDate) {
      const lastDate = new Date(user.lastStudyDate);
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastStudyDate: now,
        streakDays: currentStreak,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        goal: true,
        xp: true,
        practiceScore: true,
        streakDays: true,
        placementStatus: true,
        placementScore: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập.' });
  }
}

async function getMe(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  getMe,
};
