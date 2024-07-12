/**
 * Práctica de test de integración con supertest.
 * 
 * Probamos en secuencia el flujo de trabajo del módulo de usuarios:
 * 1- Registro de usuario con datos correctos.
 * 2- Nuevo intento de registro con mismos datos.
 * 3- Login de usuario
 * 4- Visita a endpoint current, presentando credenciales obtenidas en punto 3
 * 
 * Agregamos también una prueba de endpoint para carga de imágenes.
 */

import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };
const testPet = { name: 'Sansa', specie: 'Ratonero', birthDate: '01-01-2016'};
let cookie;

describe('Test integración Adoptme class 41', function () {
    describe('Test Users', function () {
        before(function () {});
        beforeEach(function () {});
        after(function () {});
        afterEach(function () {});
        
        it('POST /api/sessions/register debe registrar un nuevo usuario', async function () {
            const { _body } = await requester.post('/api/sessions/register').send(testUser); 

            expect(_body.payload).to.be.ok;
        });

        it('POST /api/sessions/register debe registrar un nuevo usuario', async function () {
            const { statusCode, ok, _body } = await requester.post('/api/sessions/register').send(testUser); 

            expect(statusCode).to.be.equals(400);
        });

        it('POST /api/sessions/login debe loguear correctamente al usuario', async function () {
            const result = await requester.post('/api/sessions/login').send(testUser);
            const cookieData = result.headers['set-cookie'][0];
            cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };

            expect(cookieData).to.be.ok;
            expect(cookie.name).to.be.equals('coderCookie');
            expect(cookie.value).to.be.ok;
        });

        it('POST /api/sessions/current debe devolver datos correctos de usuario', async function () {
            const { _body } = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);

            expect(_body.payload).to.have.property('name');
            expect(_body.payload).to.have.property('role');
            expect(_body.payload).to.have.property('email').and.to.be.equals(testUser.email);
        });

        it('POST /api/pets/withimage debe cargar mascota con imagen', async function () {
            const result = await requester.post('/api/pets/withimage')
                .field('name', testPet.name)
                .field('specie', testPet.specie)
                .field('birthDate', testPet.birthDate)
                .attach('image', './test/front_vs_back.jpg');

            expect(result.statusCode).to.be.equals(200);
            expect(result._body.payload).to.have.property('_id');
            expect(result._body.payload.image).to.be.ok;
        });
    });
});
