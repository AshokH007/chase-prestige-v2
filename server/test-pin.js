const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'production_banking_simulation_secure_key_987654321';

const derivePinFromToken = (token) => {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const pin = parseInt(hash.substring(0, 8), 16) % 10000;
    return pin.toString().padStart(4, '0');
};

const user = { id: 'test-id', customer_id: 'CUST123' };
const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30m' });

const pinAtLogin = derivePinFromToken(token);
console.log('Token:', token);
console.log('PIN at Login:', pinAtLogin);

// Simulate middleware extraction
const authHeader = `Bearer ${token}`;
const tokenFromHeader = authHeader.split(' ')[1];
const pinAtVerify = derivePinFromToken(tokenFromHeader);

console.log('PIN at Verify:', pinAtVerify);
console.log('Match:', pinAtLogin === pinAtVerify);
