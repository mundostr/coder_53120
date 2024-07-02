import { Router} from 'express';
import { rateLimiter } from '../utils.js';

import sessionsController from "../controllers/sessions.controller.js";
import { verifyToken } from "../utils.js";

const router = Router();

router.get('/simple', async (req, res) => {
    let total = 0;
    for (let i = 0; i < 100000; i++) total += i;
    res.status(200).send({ status: 'TODO OK', data: total });
})

router.get('/complex', async (req, res) => {
    let total = 0;
    for (let i = 0; i < 1e7; i++) total += i; // 5e8 = 4 y 8 ceros = 500.000.000
    res.status(200).send({ status: 'OK', data: total });
})

router.post('/login', rateLimiter(15, 10), sessionsController.loginUser);
router.post('/register', sessionsController.registerUser);
router.get('/restorerequest', rateLimiter(15, 10), sessionsController.restoreRequest);
// Este endpoint debe recibir un token válido para continuar
router.get('/restoreconfirm', verifyToken, sessionsController.restoreConfirm);

export default router;
