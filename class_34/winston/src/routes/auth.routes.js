import { Router } from 'express';
import passport from 'passport';

import config from '../config.js';
import { createHash, isValidPassword, verifyRequiredBody, createToken, verifyToken } from '../utils.js';
import UsersManager from '../dao/users.manager.mdb.js';
import initAuthStrategies, { passportCall } from '../auth/passport.strategies.js';

const router = Router();
const manager = new UsersManager();
initAuthStrategies();

/**
 * Middleware para control de roles (con jwt, también podría modificarse
 * para ser usado con session).
 * En breve lo reemplazaremos por un mid handlePolicies() que nos permitirá
 * manejar un array de políticas
 */
const verifyAuthorization = role => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        if (req.user.role !== role) return res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
        
        next();
    }
}

// Endpoint temporal para hashear claves de prueba
router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        if (!foundUser) {
            const process = await manager.add({ firstName, lastName, email, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Endpoint autenticación "manual" contra base de datos propia y session
router.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        if (foundUser && isValidPassword(password, foundUser.password)) {
            const { password, ...filteredFoundUser } = foundUser;
            req.session.user = filteredFoundUser;
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                res.redirect('/profile');
            });
        } else {
            res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Endpoint autenticación con Passport contra base de datos propia y session
router.post('/pplogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        req.session.user = req.user;
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Endpoint autenticación con Passport contra base de datos propia y jwt
router.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        // Creamos un token (una nueva credencial) para enviarle al usuario
        const token = createToken(req.user, '1h');
        // Notificamos al navegador para que almacene el token en una cookie
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado' });
        // Otra opción es retornar el token en la respuesta, en este caso el cliente tendrá
        // que almacenar manualmente el token de su lado y adjuntarlo en siguientes solicitudes
        // res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado', token: token });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// 2 Endpoints autenticación con Passport y tercero (Github)
router.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user:email']}), async (req, res) => {
});
router.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        // req.user es inyectado AUTOMATICAMENTE por Passport al parsear el done()
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Ejemplo protección endpoint con autenticación y autorización "manual"
router.get('/admin', verifyToken, verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Ejemplo protección endpoint con autenticación y autorización vía Passport
// router.get('/ppadmin', passport.authenticate('jwtlogin', { session: false }), verifyAuthorization('admin'), async (req, res) => {
// Llamamos a la estrategia con el mid passportCall en lugar de passport.authenticate()
// (ver passport.strategies.js)
router.get('/ppadmin', passportCall('jwtlogin'), verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/logout', async (req, res) => {
    try {
        // Si utilizamos session, destruimos los datos
        // En caso de utilizar tokens, no podemos modificar su caducidad, por lo cual
        // tendremos que bloquearlos de otra manera (por ej una lista negra) o
        // utilizar tokens con un tiempo de caducidad muy corto y regenerar nuevos
        // con un refresh token.
        req.session.destroy(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: 'Error al ejecutar logout', error: err });
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;
