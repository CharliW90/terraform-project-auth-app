const request = require('supertest');
const app = require('../app');

describe('User Auth Service', () => {
    describe('Auth Success', () => {
        test('POST /api/auth/login - should respond with success message if credentials match existing credentials', async () => {
            const { body } = await request(app).post("/api/auth/login").send({ username: 'cloudUser', password: 'cloudIsC00l' }).expect(200)
            expect(body.msg).toBe('Authorisation successful')
        });
    });
    describe('Auth Failure', () => {
        test('POST /api/auth/login - should respond with failure message if username does not match any existing credentials', async () => {
            const { body } = await request(app).post("/api/auth/login").send({ username: 'notTheUser', password: 'cloudIsC00l' }).expect(400)
            expect(body.msg).toBe('Authorisation unsuccessful - credentials incorrect')
        });
        test('POST /api/auth/login - should respond with failure message if password does not match any existing credentials', async () => {
            const { body } = await request(app).post("/api/auth/login").send({ username: 'cloudUser', password: 'cloudIsNotC00l' }).expect(400)
            expect(body.msg).toBe('Authorisation unsuccessful - credentials incorrect')
        });
    });
});
