const logger = require("./utils/logger");
const app = require("./index");

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

const server = app.listen(port, () => logger.info(`Listening on port ${port}`));

module.exports = server;

