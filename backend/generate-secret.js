const crypto = require('crypto');

// Generate a 64-character random string
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('🔐 Your JWT Secret:');
console.log(jwtSecret);
console.log('\n📋 Copy this to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}`);