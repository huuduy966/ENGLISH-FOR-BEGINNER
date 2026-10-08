const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'e4b_super_secret_jwt_key_2026_step_by_step';

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không tìm thấy mã xác thực (Token missing)' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        goal: true,
        xp: true,
        streakDays: true,
        lastStudyDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên (Admin access required)' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  JWT_SECRET,
};
