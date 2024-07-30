import { Router } from 'express';

import config from '../config.js';
import UsersManager from '../dao/users.manager.mdb.js';
import { verifyToken, handlePolicies } from '../utils.js';
import { uploader } from '../uploader.js';

const router = Router();
const manager = new UsersManager();

// Endpoint modificación propiedad role
router.get('/premium/:uid', verifyToken, handlePolicies(['admin']), async (req, res) => {
    try {
        // VALIDAR formato uid
        const uid = req.params.uid;

        // Recuperar el usuario por id y ver el valor actual del rol
        // si es premium pasa a user, si es user pasa a premium
        // Llamar al método update().
        const user = await manager.getById(uid);
        user.role = user.role === 'premium' ? 'user' : 'premium';
        // Agregar acá el control de documentos:
        // Si el array documents del user contiene al menos 3 documentos,
        // se procede al update, sino se devuelve error de faltante de documentación
        const update = await manager.update({ _id: uid}, user, { new: true });
        
        res.status(200).send({ origin: config.SERVER, payload: update });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Endpoint carga documentos
/**
 * Utilizar método array de Multer, para permitir la carga de varios documentos.
 * Recordar en el cliente utilizar el mismo nombre en el campo file (docs en este caso),
 * y agregar el modificador "multiple" para que permita subir varios archivos.
 */
router.post('/:uid/documents', verifyToken, uploader.array('docs', 3), async (req, res) => {
    try {
        // Una vez procesados los archivos por multer, en el objeto
        // req.files se tendrá toda la info para actualizar la propiedad documents del user

        // Si se desea indicar distintas rutas a Multer, una opción
        // es aprovechar el objeto req (ver resto en uploader.js)
        req.storage_path = 'documents';
        res.status(200).send({ origin: config.SERVER, payload: 'upload' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;
