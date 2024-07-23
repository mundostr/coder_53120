import multer from 'multer';
import config from './config.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        /**
         * Recordar que esto es un middleware, tenemos acceso al objeto req,
         * por lo cual podríamos tomar el req.storage_path generado en users.routes.js
         * para armar la ruta de destino del archivo:
         * 
         * cb(null, `${config.DIRNAME}/${req.storage_path}`)
         * 
         * Otra alternativa sería por ejemplo decidir la ruta en base al nombre
         * original del archivo (file.originalname)
         * 
         * let subdir = '';
         * if (file.originalname.includes('product')) subdir = 'products'
         * else if (file.originalname.includes('profile')) subdir = 'profiles'
         * etc
         * 
         * pero en este caso dependeremos de los nombres originales, lo cual
         * lógicamente no es confiable.
         */

        cb(null, config.UPLOAD_DIR)
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

export const uploader = multer({ storage: storage });
