import { Router } from 'express';

import config from '../config.js';
import ProductsManager from '../dao/products.manager.mdb.js';

const router = Router();
const manager = new ProductsManager();

router.get('/login', (req, res) => {
    res.render('login', { showError: req.query.error ? true: false, errorMessage: req.query.error });
});

// Agregado solo para testing de redirección
router.get('/login_redirect', (req, res) => {
    res.redirect('login');
});

router.get('/profile', (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/payments', async (req, res) => {
    const products = await manager.getAll();
    res.render('payments', { products });
});

export default router;
