const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
// require("winston-mongodb");

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const mongo = "mongodb://";
const URI = "localhost:27017";
const PATH = "/vidly";
const MONGO_URI = `${mongo}${URI}${PATH}`

module.exports = createLogger({
    transports: [
        // File transport
        new transports.Console({ colorize: true, prettyPrint: true}),
        new transports.File({ filename: "./logs/logfile.log", level: "debug" }),
        // new transports.MongoDB({ db: MONGO_URI, level:'debug', options:{ useUnifiedTopology:true }, collection:'logs'})
    ],
});

