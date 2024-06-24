import express from 'express';
import mongoose from 'mongoose';
import sessionsRouter from './routes/sessions.router.js';
import { faker } from '@faker-js/faker';
import cluster from 'cluster';
import { cpus } from 'os';

const app = express();
const PORT = process.env.PORT || 8080;

if (cluster.isPrimary) {
    // Proceso primario, se encarga de gestionar el cluster
    for (let i = 0; i < cpus().length; i++) {
        cluster.fork();
    }

    cluster.on('disconnect', worker => {
        console.log(`PID instance ${worker.process.pid} down, creating a new one...`);
        cluster.fork();
    });
} else {
    // Se ejecuta para cada worker
    const connection = mongoose.connect('mongodb://127.0.0.1:27017/coder_53120')
    
    app.use(express.json());
    app.use('/api/sessions',sessionsRouter);
    
    app.get('/api/test/user',(req,res)=>{
        let first_name = faker.name.firstName();
        let last_name = faker.name.lastName();
        let email = faker.internet.email();
        let password =  faker.internet.password();
        res.send({first_name,last_name,email,password})
    })
    
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT} (PID ${process.pid})`))
}
