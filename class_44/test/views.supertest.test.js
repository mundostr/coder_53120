import { expect } from 'chai';
import supertest from 'supertest';
import config from '../src/config.js';

const requester = supertest(`http://localhost:${config.PORT}`);

describe('Pruebas de redireccionamiento y renderizado', () => {
    it('Debería redirigir correctamente a login', async () => {
        const res = await requester.get('/login_redirect');
        
        expect(res.status).to.be.equal(302);
        expect(res.header.location).to.be.equal('login');
    });
    
    it('Debería renderizar correctamente login', async () => {
        const res = await requester.get('/login');
        
        expect(res.status).to.be.equal(200);
        expect(res.text).to.include('<html lang="es">');
        expect(res.text).to.include('action="/api/auth/jwtlogin"');
    });
});
