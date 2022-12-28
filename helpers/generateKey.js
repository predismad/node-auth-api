const crypto = require("node:crypto");

const KEY_LENGTH = 64;
const key = crypto.randomBytes(KEY_LENGTH).toString('hex');
console.table({ key });