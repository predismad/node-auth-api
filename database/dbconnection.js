const mongoose = require('mongoose');

const USERNAME = process.env.MONGODB_USERNAME;
const PASSWORD = process.env.MONGODB_PASSWORD;
const HOST = process.env.MONGODB_HOST;
const DATABASE = process.env.MONGODB_NAME;

const CONNECTION_STRING = `mongodb+srv://${USERNAME}:${PASSWORD}@${HOST}/${DATABASE}?retryWrites=true&w=majority`;

try {
    mongoose.connect(CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
} catch (error) {
    console.log("Error connecting to MongoDB " + error);
}

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to Database');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
