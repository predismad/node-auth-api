// RUN "node ./helpers/generateKey.js" or "npm run key" IN ROOT DIRECTORY TO GENERATE KEY
const crypto = require('crypto')

const key = crypto.randomBytes(32).toString('hex')
console.table({ key })