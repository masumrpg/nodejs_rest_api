import supertest from "supertest";
import {web} from "../src/application/web.js";
import {logger} from "../src/application/logging.js";
import {createTestUser, getTestUser, removeTestUser} from "./test-util.js";
import bcrypt from "bcrypt";

describe('POST /api/users', () => {
    afterEach(async () => {
        await removeTestUser();
    })

    // Test yang berhasil
    it('should can be register', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: "test",
                password: "Rahasia",
                name: "test"
            })

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("test")
        expect(result.body.data.name).toBe("test")
        expect(result.body.data.password).toBeUndefined()
    });

    // Test yang gagal
    it('should be rejected', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: "",
                password: "",
                name: ""
            })

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    // Duplikat
    it('should be reject if duplicate', async () => {
        let result = await supertest(web)
            .post('/api/users')
            .send({
                username: "test",
                password: "Rahasia",
                name: "test"
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("test")
        expect(result.body.data.name).toBe("test")
        expect(result.body.data.password).toBeUndefined()

        result = await supertest(web)
            .post('/api/users')
            .send({
                username: "test",
                password: "Rahasia",
                name: "test"
            })

        logger.info(result.body)

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('POST /api/users/login', () => {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can login', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: "test",
                password: "Rahasia"
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
        expect(result.body.data.token).not.toBe("test");
    });

    it('should reject login if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: "",
                password: ""
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if password is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: "test",
                password: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if username is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: "salah",
                password: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/current', () => {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can get current user', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'test');

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.name).toBe('test')
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });
});

describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can user update', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set('Authorization', 'test')
            .send({
                name: "Masum",
                password: "rahasialagi"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.name).toBe('Masum');

        const user = await getTestUser();
        expect(await bcrypt.compare('rahasialagi', user.password)).toBe(true);
    });

    it('should can user name', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set('Authorization', 'test')
            .send({
                name: "Masum"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.name).toBe('Masum');
    });

    it('should can user password', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set('Authorization', 'test')
            .send({
                password: "rahasialagi"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('test');
        expect(result.body.data.name).toBe('test');

        const user = await getTestUser();
        expect(await bcrypt.compare('rahasialagi', user.password)).toBe(true);
    });

    it('should reject update if not valid', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set('Authorization', 'salah')
            .send({});

        expect(result.status).toBe(401);
    });
});