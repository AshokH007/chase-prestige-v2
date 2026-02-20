const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            customer_id: user.customer_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short-lived token as per requirements
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const crypto = require('crypto');

const derivePinFromToken = (token) => {
    // Generate a deterministic 4-digit PIN from the token hash
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    // Take a portion of the hash, convert to int, and get last 4 digits
    const pin = parseInt(hash.substring(0, 8), 16) % 10000;
    return pin.toString().padStart(4, '0');
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    derivePinFromToken
};
