const compression = require("compression");
const cors = require('cors');
const helmet = require("helmet");

module.exports = function(app) {
    app.use(helmet());
    app.use(compression());
    //CORS middleware
    app.use(cors());
    app.options('*', cors());
}

