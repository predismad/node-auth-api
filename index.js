require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const log = require("npmlog");
const morgan = require("morgan");
require("./database/connectToDatabase");
const { version } = require("./package.json");
const { logOutputOptions } = require("./helpers/config");

// CONSTANTS
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "dev";
const COOKIE_ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY || "unsafe_key"; 

// USE PLUGINS / LIBRARIES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_ENCRYPTION_KEY));
app.use(cors());
app.use(morgan('common', { stream: logOutputOptions }));
app.use(morgan('dev'));

// HANDLE API ROUTES
app.use('/api/user', require('./routes/userRoute'));

// START SERVER
app.listen(PORT, () => {
    log.info(`Server is running on port: ${PORT}`);
    log.info(`Current node environment: ${NODE_ENV}`);
    log.info(`Current version is: ${version}`);
});
