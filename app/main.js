const config = require('dotenv').config();
const Reporter = require('./reporter.js');

let reporter = new Reporter();
reporter.run();