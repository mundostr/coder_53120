import express from 'express';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
// import cluster from 'cluster';
// import { cpus } from 'os';

import config from './config.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();

/* if (cluster.isPrimary) {
    for (let i = 0; i < cpus().length; i++) cluster.fork();

    cluster.on('disconnect', worker => {
        console.log(`PID instance ${worker.process.pid} down, creating a new one...`);
        cluster.fork();
    });
} else { */
    const connection = mongoose.connect(config.MONGODB_URI)
    
    app.use(express.json());
    app.use('/api/sessions',sessionsRouter);
    
    app.get('/api/test/user',(req,res)=>{
        let first_name = faker.name.firstName();
        let last_name = faker.name.lastName();
        let email = faker.internet.email();
        let password =  faker.internet.password();
        res.send({first_name,last_name,email,password})
    })
    
    app.listen(config.PORT, () => console.log(`Listening on PORT ${config.PORT} (PID ${process.pid})`))
/* } */
