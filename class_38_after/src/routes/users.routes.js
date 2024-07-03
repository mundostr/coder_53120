import { Router } from 'express';

import config from '../config.js';
import UsersManager from '../dao/users.manager.mdb.js';
import { verifyToken, handlePolicies } from '../utils.js';

const router = Router();
const manager = new UsersManager();

// Modifica la propiedad role
router.get('/premium/:uid', verifyToken, handlePolicies(['admin']), async (req, res) => {
    try {
        // VALIDAR formato uid
        const uid = req.params.uid;

        // Recuperar el usuario por id y ver el valor actual del rol
        // si es premium pasa a user, si es user pasa a premium
        // Llamar al método update().
        const user = await manager.getById(uid);
        user.role = user.role === 'premium' ? 'user' : 'premium';
        const update = await manager.update({ _id: uid}, user, { new: true });
        
        res.status(200).send({ origin: config.SERVER, payload: update });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;
