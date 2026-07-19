const jwt = require('jsonwebtoken');
const db = require('../db/knex');

module.exports = (...roles) => {
  console.log('[AUTH] roles allowed:', roles);
  return (req, res, next) => {
    try {
      // 1) เข้ามาถึง middleware ไหม + method/path
      console.log('[AUTH] hit:', req.method, req.originalUrl);

      // 2) ดู Authorization header ที่ส่งมา *จริง*
      const header = req.headers.authorization || '';
      console.log('[AUTH] header:', header || '(empty)');

      // 3) กรณีเบราว์เซอร์ส่ง OPTIONS (preflight) ให้ผ่านเลย (กัน CORS กวนตอน debug)
      if (req.method === 'OPTIONS') {
        console.log('[AUTH] skip OPTIONS');
        return res.sendStatus(204);
      }

      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) {
        console.log('[AUTH] -> 401 Missing token');
        return res.status(401).json({ success: false, message: 'Missing token' });
      }

      // 4) ลอง decode ดูค่า (dev only)
      // console.log('[AUTH] decode:', jwt.decode(token));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] verified payload:', payload);

      if (roles.length && !roles.includes(payload.role)) {
        console.log('[AUTH] -> 403 Forbidden (role not allowed)', roles, 'got:', payload.role);
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      req.user = payload;
      console.log('[AUTH] -> next, user:', req.user);

      // อัปเดตเวลาใช้งานล่าสุด (ไม่บล็อกการทำงาน)
      db('users')
        .where({ id: payload.id })
        .update({ last_active_at: db.fn.now() })
        .catch(err => {
          // ดักจับข้อผิดพลาดเงียบ เพื่อป้องกันไม่ให้ระบบล่มถ้ายังไม่ได้รัน SQL
          console.error('[AUTH] Failed to update last_active_at:', err.message);
        });

      return next();
    } catch (e) {
      console.log('[AUTH] ERROR:', e.name, e.message);
      e.status = e.name === 'JsonWebTokenError' ? 401 : 500;
      next(e);
    }
  };
};
