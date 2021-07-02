const app = require("../src/app");
const supertest = require('supertest');
const request = supertest(app);

describe("Cadastro do usuário", () => {
    test("Deve cadastrar um usuário com sucesso", () => {
        const time = Date.now();
        const email = `${time}@email.com`;
        const user = {name: "Lucian", email, password: "123456"};

        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });

    test("Deve impedir que um usuário se cadastre com os dados vazios", () => {
        const user = {name: "", email: "", password: ""};

        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(400);
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });

    test("Deve impedir que um usuário se cadastre com um e-mail repetido", () => {
        const time = Date.now();
        const email = `${time}@email.com`;
        const user = {name: "Binner", email, password: "123456"};

        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);

                return request.post("/user")
                .send(user)
                .then(res => {
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error).toEqual("E-mail já cadastrado");
                }).catch(err => {
                    expect(err).toMatch('error');
                });
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });
});