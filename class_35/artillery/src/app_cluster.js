/**
 * Código base habilitación clusters
 */

// Imports de la app
import cluster from 'cluster';
import { cpus } from 'os';

// Creación instancia de Express
/* const app = express();
const PORT = process.env.PORT || 8080; */

if (cluster.isPrimary) {
    // Proceso primario, se encarga de gestionar el cluster
    // Levanto tantos workers como núcleos disponibles
    for (let i = 0; i < cpus().length; i++) cluster.fork();

    // Si alguna instancia se cae, se levanta una nueva para reemplazarla
    cluster.on('disconnect', worker => {
        console.log(`PID instance ${worker.process.pid} down, creating a new one...`);
        cluster.fork();
    });
} else {
    // Contenido de la app, hasta el listen().
}
