import winston from 'winston';

import config from './config.js';

const prodLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'http' }),
        new winston.transports.File({ level: 'warn', filename: `${config.DIRNAME}/logs/errors.log`})
    ]
});

const addLogger = (req, res, next) => {
    req.logger = prodLogger;
    req.logger.warn(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
}

export default addLogger;
