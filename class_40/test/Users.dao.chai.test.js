// Realizamos el mismo paquete de tests que Users.dao.test.js, pero
// utilizando la sintaxis de chai en lugar del módulo nativo assert.
// Esta sintaxis es más cómodo e intuitiva.

import chai from 'chai';
import mongoose from 'mongoose';
import UsersDAO from '../src/dao/Users.dao.js';

const connection  = await mongoose.connect('mongodb://127.0.0.1:27017/coder_53120');
const dao = new UsersDAO();
const expect = chai.expect;
const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };

describe('Tests DAO Users', function () {
    // Se ejecuta ANTES de comenzar el paquete de tests
    before(function () {
        // Vaciando la colección adoptme_users_tests
        mongoose.connection.collections.adoptme_users_tests.drop();
    });
    // Se ejecuta ANTES de CADA test
    beforeEach(function () {
        this.timeout = 3000;
    });
    // Se ejecuta FINALIZADO el paquete de tests
    after(function () {});
    // Se ejecuta FINALIZADO CADA text
    afterEach(function () {});
    
    // Lista de tests
    it('get() debe retornar un array de usuarios', async function () {
        const result = await dao.get();

        expect(result).to.be.an('array');
    });

    it('save() debe retornar un objeto con los datos del nuevo usuario', async function () {
        const result = await dao.save(testUser);

        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(result.pets).to.be.deep.equal([]);
    });

    it('getBy() debe retornar un objeto coincidente con el mail deseado', async function () {
        const result = await dao.getBy({ email: testUser.email });
        // Aprovechamos a guardar en testUser el _id que acabamos de recuperar,
        // para usarlo en siguientes tests.
        testUser._id = result._id;

        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(result.email).to.be.equal(testUser.email);
    });

    it('update() debe retornar un objeto con datos correctamente modificados', async function () {
        const modifiedEmail = 'jperez2@gmail.com';
        const result = await dao.update(testUser._id, { email: modifiedEmail });

        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(result.email).to.be.equal(modifiedEmail);
    });

    it('delete() debe borrar el documento con el id indicado', async function () {
        const result = await dao.delete(testUser._id);

        // Este test se podría complementar con una búsqueda utilizando
        // el id testUser._id, la cual debería devolver un contenido vacío
        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
    });
});
