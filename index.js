require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('./database/dbConnection');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const userRoute = require('./Routes/User.route');

app.use('/api/user', userRoute);

app.listen(process.env.NODE_PORT, () => {
    console.log('Server is running on port ' + process.env.NODE_PORT);
});