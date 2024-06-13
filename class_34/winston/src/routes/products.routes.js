import { Router } from 'express';

import config from '../config.js';
import { uploader } from '../uploader.js';
import ProductsManager from '../dao/products.manager.mdb.js';

const router = Router();
const manager = new ProductsManager();

router.get('/', async (req, res) => {
    try {
        const products = await manager.getAll();
        // req.logger.info(`Se visitó el listado de productos`);

        res.status(200).send({ origin: config.SERVER, payload: products });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

/**
 * El método param nos permite correr código de verificación para un parámetro
 * indicado (id en este caso).
 * 
 * En cualquier endpoint debajo donde aparezca req.params.id, Express inyectará
 * automáticamente este mid para verificar el formato de id de MongoDB.
 */
router.param('id', async (req, res, next) => {
    if (config.MONGODB_ID_REGEX.test(req.params.id)) {
        next();
    } else {
        res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });   
    }
});

router.get('/one/:id', async (req, res) => {
    try {
        const product = await manager.getById(req.params.id);

        res.status(200).send({ origin: config.SERVER, payload: product });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post('/', uploader.single('thumbnail'), async (req, res) => {
    try {
        const socketServer = req.app.get('socketServer');
        const process = await manager.add(req.body);
        
        res.status(200).send({ origin: config.SERVER, payload: process });

        socketServer.emit('newProduct', req.body);
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const update = req.body;
        const options = { new: true };
        const process = await manager.update(filter, update, options);
        
        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const process = await manager.delete(filter);

        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

/**
 * Endpoint de tipo catchall.
 * Si la url ingresada no cumple con ninguno de los endpoints habilitados previamente,
 * la solicitud será atendida por esta rutina
 */
router.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
});

export default router;
