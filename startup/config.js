const config = require("config");
const logger = require("../utils/logger");

module.exports = function() {
    if (config.get("jwtPrivateKey") === "undefined" || !config.get("jwtPrivateKey")) {
        throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
    }
}