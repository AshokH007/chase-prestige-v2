require('dotenv').config();
const security = require('./src/utils/security');
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('HF_TOKEN present:', !!process.env.HF_TOKEN);
const token = security.generateToken({ id: 1, customer_id: 'CUST1' });
console.log('Token generated:', !!token);
const decoded = security.verifyToken(token);
console.log('Token verified:', !!decoded);
