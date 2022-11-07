const logger = require("../utils/logger");
const winston = require("winston");

require("express-async-errors");

module.exports = function() {
    process.on("unhandledRejection", (ex) => {
        throw ex;
    })
    
    logger.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: "./logs/uncaughtExceptions.log" }));
}