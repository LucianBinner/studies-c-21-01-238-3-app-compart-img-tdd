const app = require("../src/app");
const supertest = require('supertest');
const request = supertest(app);

const mainUser = {
    name: "Lucian Binner",
    email: "lucian@email.com",
    password: "123456",
};

beforeAll(() => {
    return request
        .post("/user")
        .send(mainUser)
        .then(res => { })
        .catch(err => {
            console.log(err);
        });
});

afterAll(() => {
    return request
        .delete(`/user/${mainUser.email}`)
        .then(res => { })
        .catch(err => {
            console.log(err);
        });
});

describe("Cadastro do usuário", () => {
    test("Deve cadastrar um usuário com sucesso", () => {
        const time = Date.now();
        const email = `${time}@email.com`;
        const user = { name: "Lucian", email, password: "123456" };

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
        const user = { name: "", email: "", password: "" };

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
        const user = { name: "Binner", email, password: "123456" };

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

describe("Autenticação", () => {
    test("Deve retornar um token quando logar", () => {
        return request
            .post("/auth")
            .send({ email: mainUser.email, password: mainUser.password })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.token).toBeDefined();
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });

    test("Deve impedir que um usuário não cadastrado se logue", () => {
        return request
            .post("/auth")
            .send({ email: "emailnaocadastrado@email.com", password: "123456gfghj" })
            .then(res => {
                expect(res.statusCode).toEqual(403);
                expect(res.body.errors.email).toEqual("E-mail não cadastrado!");
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });

    
    test("Deve impedir que um usuário se logue com uma senha errada", () => {
        return request
            .post("/auth")
            .send({ email: mainUser.email, password: "senha-errada" })
            .then(res => {
                expect(res.statusCode).toEqual(403);
                expect(res.body.errors.password).toEqual("Senha inválida!");
            })
            .catch(err => {
                expect(err).toMatch('error');
            });
    });
});