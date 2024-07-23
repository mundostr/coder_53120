import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

import config from './config.js';
import initSocket from './sockets.js';
import viewsRouter from './routes/views.routes.js';
import usersRouter from './routes/users.routes.js';
import authRouter from './routes/auth.routes.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import addLogger from './logger.js';

const app = express();

const expressInstance = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI);

    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);

    app.use(cors({ origin: '*' }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(config.SECRET));
    
    app.engine('handlebars', handlebars.engine());
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine', 'handlebars');

    app.use(addLogger);
    app.use('/', viewsRouter);
    app.use('/api/carts', cartsRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/products', productsRouter);
    app.use('/api/auth', authRouter);
    app.use('/static', express.static(`${config.DIRNAME}/public`));

    // Generamos objeto base config Swagger y levantamos
    // endpoint para servir la documentación
    const swaggerOptions = {
        definition: {
            openapi: '3.0.1',
            info: {
                title: 'Documentación sistema AdoptMe',
                description: 'Esta documentación cubre toda la API habilitada para AdoptMe',
            },
        },
        apis: ['./src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
    };
    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

    console.log(`App activa en puerto ${config.PORT} conectada a bbdd ${config.SERVER}`);
});
