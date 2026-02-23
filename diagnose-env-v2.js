const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const security = require('./server/src/utils/security');
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
}
console.log('HF_TOKEN present:', !!process.env.HF_TOKEN);
try {
    const token = security.generateToken({ id: 1, customer_id: 'CUST1' });
    console.log('Token generated successfully');
    const decoded = security.verifyToken(token);
    console.log('Token verified successfully:', !!decoded);
} catch (e) {
    console.error('Error during security operations:', e.message);
}
