/**
 * Esta es una aplicación de muestra para ver la operación del logger Winston.
 * 
 * Revisar logger.js para detalles, aquí solamente importamos el mid addLogger
 * y lo activamos globalmente con use().
 */

import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import FileStore from 'session-file-store';
// import MongoStore from 'connect-mongo';
import passport from 'passport';

import config from './config.js';
import initSocket from './sockets.js';
import viewsRouter from './routes/views.routes.js';
import productsRouter from './routes/products.routes.js';
import usersRouter from './routes/users.routes.js';
import cartsRouter from './routes/carts.routes.js';
import authRouter from './routes/auth.routes.js';
import addLogger from './logger.js'

const app = express();

const expressInstance = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI);

    const socketServer = initSocket(expressInstance);

    app.engine('handlebars', handlebars.engine());
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine', 'handlebars');
    app.set('socketServer', socketServer);

    // Logger habilitado globalmente
    app.use(addLogger);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(config.SECRET));
    
     // ttl = time to live (tiempo de vida de la sesión en segundos)
    const fileStorage = FileStore(session);
    app.use(session({
        store: new fileStorage({ path: './sessions', ttl: 100, retries: 0 }),
        // si queremos almacenar sesión en MongoDB, cambiamos por este store
        // store: MongoStore.create({ mongoUrl: config.MONGODB_URI, ttl: 600 }),
        secret: config.SECRET,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/', viewsRouter);
    app.use('/api/products', productsRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/carts', cartsRouter);
    app.use('/api/auth', authRouter);
    app.use('/static', express.static(`${config.DIRNAME}/public`));

    console.log(`App activa en puerto ${config.PORT} conectada a bbdd ${config.SERVER}`);
});
