import Assert from 'assert';
import mongoose from 'mongoose';
import UsersDAO from '../src/dao/Users.dao.js';

const connection  = await mongoose.connect('mongodb://127.0.0.1:27017/coder_53120');
const dao = new UsersDAO();
const assert = Assert.strict;
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

        // Para pasar, debe retornar un array
        assert.strictEqual(Array.isArray(result), true);
    });

    it('save() debe retornar un objeto con los datos del nuevo usuario', async function () {
        const result = await dao.save(testUser);

        // Para pasar, debe retornar un objeto que contenga una ppdad _id
        // y otra pets que sea array vacío
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.pets, []);
    });

    it('getBy() debe retornar un objeto coincidente con el mail deseado', async function () {
        const result = await dao.getBy({ email: testUser.email });
        // Aprovechamos a guardar en testUser el _id que acabamos de recuperar,
        // para usarlo en siguientes tests.
        testUser._id = result._id;

        // Para pasar, debe retornar un objeto que contenga una ppdad _id
        // y otra email, que sea igual al mail de prueba original
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.email, testUser.email);
    });

    it('update() debe retornar un objeto con datos correctamente modificados', async function () {
        const modifiedEmail = 'jperez2@gmail.com';
        const result = await dao.update(testUser._id, { email: modifiedEmail });

        // Para pasar, debe retornar un objeto que contenga una ppdad _id
        // y otra email, que sea igual al nuevo mail
        // ATENCION!: recordar modificar el método update del DAO, el
        // findByIdAndUpdate debe recibir un tercer objeto de configuración
        // { new: true } para que retorne el contenido modificado, caso contrario
        // retornará el contenido original y por ende el test no pasará
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.strictEqual(result.email, modifiedEmail);
    });

    it('delete() debe borrar el documento con el id indicado', async function () {
        const result = await dao.delete(testUser._id);

        // Para pasar, debe retornar un objeto que contenga una ppdad _id
        // Este test se podría complementar con una búsqueda utilizando
        // el id testUser._id, la cual debería devolver un contenido vacío
        assert.strictEqual(typeof(result), 'object');
        assert.deepStrictEqual(result._id, testUser._id);
    });
});
