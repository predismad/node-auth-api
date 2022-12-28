const { days } = require("./timeUtils");
const rfs = require("rotating-file-stream");
const path = require("path");

const accessTokenOptions = { expiresIn: '5m' }
const refreshTokenOptions = { expiresIn: '1y' }

const refreshTokenCookieOptions = {
    maxAge: days(365),
    signed: true,
    httpOnly: true
}

const logOutputOptions = rfs.createStream('access.log', {
    interval: '5M', // rotate every 5MB
    path: path.join(__dirname, '../log')
});

module.exports = {
    refreshTokenCookieOptions,
    logOutputOptions,
    accessTokenOptions,
    refreshTokenOptions
}