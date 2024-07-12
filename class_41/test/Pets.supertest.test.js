/**
 * Primer práctica con supertest para testear solicitudes directas a endpoints
 */

import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
// const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };
const testPet = { name: 'Sansa', specie: 'Ratonero', birthDate: '01-01-2016'};

describe('Test integración Adoptme class 41', function () {
    describe('Test Pets', function () {
        before(function () {});
        beforeEach(function () {});
        after(function () {});
        afterEach(function () {});
        
        it('POST /api/pets debe cargar correctamente una mascota', async function () {
            const { statusCode, ok, _body } = await requester.post('/api/pets').send(testPet);
            testPet._id = _body.payload._id;

            expect(_body.payload).to.have.property('_id');
            expect(_body.payload).to.have.property('adopted').equals(false);
        });

        it('POST /api/pets sin name, debe retornar 400', async function () {
            const { name, ...filteredTestPet } = testPet;
            const { statusCode, ok, _body } = await requester.post('/api/pets').send(filteredTestPet);

            expect(statusCode).to.be.equals(400);
        });

        it('GET /api/pets debe retornar array de mascotas', async function () {
            const result = await requester.get('/api/pets');
            const body = result._body;

            expect(body).to.have.property('status');
            expect(body).to.have.property('payload').and.to.be.an('array');
        });

        it('PUT /api/pets debe actualizar correctamente mascota', async function () {
            const newName = 'Peluca';
            const result = await requester.put(`/api/pets/${testPet._id}`).send({ name: newName });
            const result2 = await requester.get('/api/pets');
            const body = result2._body.payload[0];

            expect(body.name).to.be.equal(newName);
        });

        it('DELETE /api/pets debe borrar correctamente mascota', async function () {
            const result = await requester.delete(`/api/pets/${testPet._id}`);
            const result2 = await requester.get('/api/pets');
            const body = result2._body.payload;

            expect(body).to.be.an('array').that.is.empty;
            // expect(body.length).to.be.equals(0);
        });
    });
});
