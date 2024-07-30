import { Router } from 'express';

import config from '../config.js';
import CartsManager from '../dao/carts.manager.mdb.js';
import ProductsManager from '../dao/products.manager.mdb.js';
import { verifyToken } from '../utils.js';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = Router();
const manager = new CartsManager();
const productManager = new ProductsManager();
const clientStr = new Stripe(config.STRIPE_KEY);
const clientMP = new MercadoPagoConfig({ accessToken: config.MERCADOPAGO_ACCESS_TOKEN });

export const checkOwnership = async (pid, email) => {
    const product = await manager.getById(pid);
    if (!product) return false;
    return product.owner === email;
}

router.put('/:cid/products/:pid/:qty', verifyToken, async (req, res) => {
    try {
        // Validar formato de cid, pid y qty, sea con middleware o manualmente acá
        const cid = req.params.cid;
        const pid = req.params.pid;
        const qty = req.params.qty;
        const email = req.user.email;
        let proceedWithCartUpdate = true;

        if (req.user.role === 'premium') proceedWithCartUpdate = !await checkOwnership(pid, email);

        if (proceedWithCartUpdate) {
            // Ejecutar rutina de modificación de array products en carrito
            res.status(200).send({ origin: config.SERVER, payload: 'Producto agregado' });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: 'No puede agregar productos propios al carrito' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/success', (req, res) => { res.redirect('/static/payment_success.html') })
router.get('/cancel', (req, res) => { res.redirect('/static/payment_cancel.html') })

router.post('/checkoutstr', async (req, res) => {
    try {
        const data = {
            line_items: req.body,
            mode: 'payment', // puede ser suscription también para habilitar pagos recurrentes
            success_url: `http://localhost:${config.PORT}/api/carts/success`,
            cancel_url: `http://localhost:${config.PORT}/api/carts/cancel`
        };

        const payment = await clientStr.checkout.sessions.create(data);

        res.status(200).send(payment);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/checkoutmp', async (req, res) => {
    try {
        const data = {
            items: req.body,
            back_urls: {
                success: 'https://google.com', // Estas urls no funcionan con localhost
                failure: 'https://google.com'
            },
            auto_return: 'approved'
        }

        const service = new Preference(clientMP);
        const payment = await service.create({ body: data });

        res.status(200).send({ url: payment.sandbox_init_point });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
