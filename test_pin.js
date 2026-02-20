const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const derivePinFromToken = (token) => {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const pin = parseInt(hash.substring(0, 8), 16) % 10000;
    return pin.toString().padStart(4, '0');
};

const SECRET = 'test_secret';

// Simulate Login
const tokenBeforeWire = jwt.sign({ id: 1 }, SECRET);
const pinAtLogin = derivePinFromToken(tokenBeforeWire);

// Simulate Axios/Header
const authHeader = `Bearer ${tokenBeforeWire}`;

// Simulate Middleware
const tokenAfterWire = authHeader.split(' ')[1];
const pinAtVerify = derivePinFromToken(tokenAfterWire);

console.log('--- PIN DERIVATION CONSISTENCY TEST ---');
console.log('Token Match:', tokenBeforeWire === tokenAfterWire);
console.log('PIN Match:', pinAtLogin === pinAtVerify);
console.log('Derived PIN:', pinAtLogin);
process.exit(0);
