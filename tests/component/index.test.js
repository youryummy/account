import fs from "fs";
import request from "request";
import server from "../../server.js";
import Account from "../../mongo/Account.js";
import { strict as assert } from 'node:assert';

// Aux function
const assertRequest = (url, {aggFunction = (d) => d, ...opts}, expectation, done) => {
    if (opts.body) opts.body = JSON.stringify(opts.body);

    request({
        uri: url,
        method: opts.method.toUpperCase(),
        headers: {
            'Cookie': opts.headers?.cookie ?? '',
            'Authorization': opts.headers?.['authorization'],
            ...(opts.headers?.['content-type'] ? {'Content-Type': opts.headers?.['content-type']} : {})
        },
        ...((/POST|PUT/i).test(opts.method) && (/application\/json/).test(opts.headers?.['content-type']) ? {body: opts.body} : {}),
        ...((/POST|PUT/i).test(opts.method) && !opts.headers?.['content-type'] ? {formData: opts.formData} : {}),
    }, (err, res) => {
        if (err) done(err);
        else {
            let ctype = res.headers['content-type'] ?? '';
            let body = res.body?.length > 0 ? (/application\/json/.test(ctype) ? JSON.parse(res.body) : res.body) : undefined
            
            assert.equal(res.statusCode, expectation.code);
            assert.deepStrictEqual(aggFunction(body), expectation.body);
            assert.match(res.headers?.["set-cookie"]?.toString() ?? "", expectation.headers?.cookie ?? /.*/);
            done();
        }
    })
}

describe("Component testing", () => {
    before(() => {
        // Wait for the service to start
        let delay = new Promise(resolve => setTimeout(resolve, 3000))
        return delay
    })

    describe("POST tests", () => {

        after(() => {
            return Promise.all([
                Account.deleteOne({username: "TestNoDup"}),
                Account.findOneAndDelete({username: "TestNoDupAvatar"}).then((acc) => {
                    server.fileRef(acc)?.delete().catch((err) => console.warn(`Couldn't delete firebase file: ${err}`));
                })
            ]);
        });

        it("LOGIN should return 201 and write the Set-Cookie header", (done) => {
            const expectation = {code: 201, headers: {cookie: /authToken=.*;/}};
            const opts = {method: "post", body: {username: "test", password: "Test1234"}, headers: { "content-type": "application/json" }};
            assertRequest("http://localhost:8080/api/v1/login", opts, expectation, done);
        });

        it("LOGIN should return 400 when invalid credentials provided", (done) => {
            const expectation = {code: 400, body: {message: "Invalid username or password"}};
            const opts = {method: "post", body: {username: "test", password: "Incorrect123"}, headers: { "content-type": "application/json" }};
            assertRequest("http://localhost:8080/api/v1/login", opts, expectation, done);
        });

        it("REGISTER sould return 201 and insert new user in DB", (done) => {
            const expectation = {code: 201};
            const opts = {
                method: "post",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "TestNoDup", 
                        password: "Test1234",
                        email: "testNoDup@example.com",
                        fullName: "Test No Dup",
                        birthDate: "1990-01-01"
                    })
                }
            };
            assertRequest("http://localhost:8080/api/v1/register", opts, expectation, done);
        });

        it("REGISTER sould return 201 and insert new user in DB with an Avatar", (done) => {
            const expectation = {code: 201};
            const opts = {
                method: "post",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "TestNoDupAvatar", 
                        password: "Test1234",
                        email: "testNoDupAvatar@example.com",
                        fullName: "Test No Dup with Avatar",
                        birthDate: "1990-01-01"
                    }),
                    Avatar: fs.createReadStream("tests/component/img/test-image.png")
                }
            };
            let preDone = (err) => {
                if (err) done(err);
                else {
                    Account.findOne({username: "TestNoDupAvatar"}).then((acc) => {
                        assert.ok(acc);
                        request(acc.avatar, (err, res) => {
                            assert.ok(res.body.length > 0);
                            done(err)
                        });
                    })
                }
            }
            assertRequest("http://localhost:8080/api/v1/register", opts, expectation, preDone);
        });

        it("REGISTER sould return 400 when invalid password provided", (done) => {
            const expectation = {code: 400, body: true};
            const opts = {
                aggFunction: (data) => data.error?.includes("Validation failed at #/properties/AccountInfo/allOf/0/properties/password/pattern"),
                method: "post",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "TestNoDupAvatar2", 
                        password: "invalid",
                        email: "testNoDupAvatar2@example.com",
                        fullName: "Test No Dup with Avatar again",
                        birthDate: "1990-01-01"
                    })
                }
            };
            assertRequest("http://localhost:8080/api/v1/register", opts, expectation, done);
        });

        it("REGISTER sould return 400 when username already exists", (done) => {
            const expectation = {code: 400, body: { message: "username: 'test' is duplicated, must be unique" }};
            const opts = {
                method: "post",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "test", 
                        password: "Test1234",
                        email: "testNoDupAvatar3@example.com",
                        fullName: "Test No Dup with Avatar again",
                        birthDate: "1990-01-01"
                    }),
                    Avatar: fs.createReadStream("tests/component/img/test-image.png")
                }
            };
            assertRequest("http://localhost:8080/api/v1/register", opts, expectation, done);
        });
        
    });

    describe("GET tests", () => {    

        it("should return 200 and get all users in DB", (done) => {
            const expectation = {code: 200, body: 8};
            const opts = {method: "get", aggFunction: (data) => data.length};
            assertRequest("http://localhost:8080/api/v1/accounts", opts, expectation, done);
        });

        it("should return 200 and find user 'test' in DB", (done) => {
            const expectation = {code: 200, body: "test"};
            const opts = {method: "get", aggFunction: (data) => data.username};
            assertRequest("http://localhost:8080/api/v1/accounts/test", opts, expectation, done);
        });

        it("should return 404 when no user with specified userId found", (done) => {
            const expectation = {code: 404, body: {message: "Account with username 'testNotFound' does not exist"}};
            const opts = {method: "get"};
            assertRequest("http://localhost:8080/api/v1/accounts/testNotFound", opts, expectation, done);
        });
    });

    describe("PUT tests", () => {

        before(() => {
            return Account.create({ username: "modifiableUser", password: "SomePassword100209", fullName: "modifiable user", email: "modifiableemail@example.com", role: "user", plan: "base"})
        });

        after(() => {
            return Account.deleteOne({ username: "modifiableUser" })
        });

        it("Should return 204 and update the account and the cookie", (done) => {
            const expectation = {code: 204, headers: {cookie: /authToken=.*;/}};
            const opts = {
                method: "put",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "modifiableUser", 
                        password: "Test1234",
                        email: "modifiableemail@example.com",
                        fullName: "modifiable user",
                        birthDate: "1990-01-01",
                        plan: "premium"
                    })
                }
            };
            assertRequest("http://localhost:8080/api/v1/accounts/modifiableUser", opts, expectation, done);
        });
        
        it("Should return 400 when given invalid email", (done) => {
            const expectation = {code: 400, body: { message: "email: 'test@example.com' is duplicated, must be unique"}};
            const opts = {
                method: "put",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "modifiableUser", 
                        password: "Test1234",
                        email: "test@example.com",
                        fullName: "modifiable user",
                        birthDate: "1990-01-01",
                        plan: "base"
                    })
                }
            };
            assertRequest("http://localhost:8080/api/v1/accounts/modifiableUser", opts, expectation, done);
        });

        it("Should return 404 when target user does not exist", (done) => {
            const expectation = {code: 404, body: {message: "Account with username 'notExistentUser' does not exist"}};
            const opts = {
                method: "put",
                formData: {
                    AccountInfo: JSON.stringify({
                        username: "modifiableUser", 
                        password: "Test1234",
                        email: "modifiableemail@example.com",
                        fullName: "modifiable user",
                        birthDate: "1990-01-01",
                        plan: "premium"
                    })
                }
            };
            assertRequest("http://localhost:8080/api/v1/accounts/notExistentUser", opts, expectation, done);
        });

    });

    describe("DELETE tests", () => {

        before(() => {
            return Account.create({ username: "deletableUser", password: "SomePassword100209", fullName: "deletable user", email: "deletableemail@example.com", role: "user", plan: "base"})
        });

        it("Should return 204 and delete the user when found", (done) => {
            const expectation = {code: 204};
            const opts = { method: "delete" };
            assertRequest("http://localhost:8080/api/v1/accounts/deletableUser", opts, expectation, done);
        });

        it("Should return 204 when no user is found", (done) => {
            const expectation = {code: 204};
            const opts = { method: "delete" };
            assertRequest("http://localhost:8080/api/v1/accounts/notExistentUser", opts, expectation, done);
        });
    });
})