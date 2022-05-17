// RUN "node ./helpers/generateKey.js" IN ROOT DIRECTORY TO GENERATE KEY
const crypto = require('crypto')

const key = crypto.randomBytes(32).toString('hex')
console.table({ key })