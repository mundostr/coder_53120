import { Router } from 'express';

import config from '../config.js';

const router = Router();

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

export default router;
