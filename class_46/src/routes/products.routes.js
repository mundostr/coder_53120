import Joi from 'joi';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import config from '../config.js';
import ProductsManager from '../dao/products.manager.mdb.js';
import { verifyToken, handlePolicies } from '../utils.js';

const router = Router();
const manager = new ProductsManager();

const checkOwnership = async (pid, email) => {
    const product = await manager.getById(pid);
    if (!product) return false;
    return product.owner === email;
}

const validateSchema = (req, res, next) => {
    const rules = Joi.object({
        title: Joi.string().min(3).required().messages({ 'string.min': 'title debe tener al menos 3 caracteres', 'string.empty': 'title es obligatorio' }),
        price: Joi.number().required(),
        stock: Joi.number().required().min(10)
    });
    // stripUnknown: quita del req.body las propiedades que no estén en rules
    
    const { error, value } = rules.validate(req.body, { stripUnknown: true });
    if (error) {
        // const messages = error.details.map(detail => detail.message);
        return res.status(400).send({ origin: config.SERVER, payload: null, error: error.details[0].message });
    }

    req.body = value;
    next();
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 3, // hasta 100 solicitudes por ip en esa ventana
    message: 'Se excedió el límite de solicitudes desde este IP, aguarde 15 mins e intente nuevamente'
});

router.get('/', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: await manager.getAll() });
});

router.post('/', limiter, verifyToken, handlePolicies(['admin', 'premium']), validateSchema, async (req, res) => {
    try {
        // Estos datos vendrían del req.body
        // VALIDAR antes de continuar
        /* const newProduct = {
            title: 'El nuevo producto',
            price: 8000.22,
            stock: 100,
            owner: req.user.role === 'premium' ? req.user.email : 'admin'
        }; */

        // Llamar a rutina del controlador que carga el producto
        res.status(200).send({ origin: config.SERVER, payload: req.body });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.delete('/:pid', verifyToken, handlePolicies(['admin', 'premium']), async (req, res) => {
    try {
        // Validar formato de pid, sea con middleware o manualmente acá
        const pid = req.params.pid;
        const email = req.user.email;
        let proceedWithDelete = true;

        if (req.user.role === 'premium') proceedWithDelete = await checkOwnership(pid, email);

        if (proceedWithDelete) {
            // Ejecutar llamada a método para borrar producto
            res.status(200).send({ origin: config.SERVER, payload: 'Producto borrado' });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: 'No tiene permisos para borrar el producto' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;
