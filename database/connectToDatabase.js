const mongoose = require('mongoose');
const log = require('npmlog');

const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const DATABASE = determineDatabase();
const CONNECTION_STRING = `mongodb://${MONGO_HOST}:27017/${DATABASE}`;

mongoose.set('strictQuery', false);

try {
    mongoose.connect(CONNECTION_STRING, {
        "authSource": "admin",
        "useNewUrlParser": true,
        "useUnifiedTopology": true,
    });
} catch (error) {
    log.error("Error connecting to MongoDB " + error);
}

mongoose.connection.on('connected', () => {
    log.info(`Mongoose connected to Database: ${DATABASE}`);
});

mongoose.connection.on('error', (err) => {
    log.error('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    log.info('Mongoose disconnected');
});

process.on('SIGINT', async () => {
    log.info("Server stopped");
    await mongoose.connection.close();
    process.exit(0);
});

function determineDatabase() {
    var database = "twitter-clone";
    if (process.env.NODE_ENV === "test") {
        database = "twitter-clone-test";
    }
    return database;
}
