import { login, register } from "../../../controllers/credentialManager.js";
import { strict as assert } from 'node:assert';
import mocks from "../../mocks/index.js";
import bcrypt from "bcrypt";

// Auxiliar functions
const req = {}, res = {}, mocklist = []; 
const assertRequest = (expectedCode, expectedData, done) => {
    res.status = (code) => { 
        try {
            assert.deepStrictEqual(code, expectedCode); 
            return { ...res, send: (data) => { assert.deepStrictEqual(data, expectedData); done(); } } 
        } catch(err) { 
            if (code >= 400) done(err);
            else res.status = () => done(err);
        }
    };
}

// TEST SUITE
describe("Credential manager tests", () => {
    
    before(() => {
        mocklist.push(mocks.signToken());
    });

    after(() => {
        while (mocklist.length > 0) {
            mocklist.pop().restore();
        }
    });

    /* LOGIN TEST SUITE */
    describe("Login tests", () => {
        
        let breaker;
        const fixture = (username, password, dbUsername = username, dbPassword = password, throwException = false) => {
            res.locals.oas.body = { username, password };
            breaker = mocks.circuitBreaker(throwException, "Circuit is open")
                .fire("findOne", username === dbUsername ? { 
                    dbUsername, 
                    password: bcrypt.hashSync(dbPassword, 10)
                } : null );
        }

        beforeEach(() => {
            res.locals = { oas: {}}
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it("Should return 200 when logged in successfully", (done) => {
            fixture("test", "test");
            login(req, res);
            assertRequest(201, undefined, done);
        });

        it("Should return 400 when username is invalid", (done) => {
            fixture("test", "test", "invalidUser");
            login(req, res);
            assertRequest(400, {message: 'Invalid username or password'}, done);
        });

        it("Should return 400 when password is invalid", (done) => {
            fixture("test", "test", "test", "invalidPassword");
            login(req, res);
            assertRequest(400, {message: 'Invalid username or password'}, done);
        });

        it("Should return 500 when database fails", (done) => {
            fixture("test", "test", "test", "test", true);
            login(req, res);
            assertRequest(500, {message: "Unexpected error ocurred, please try again later"}, done);
        });
    });

    /* REGISTER TEST SUITE */
    describe("Register tests", () => {
        let breaker;
        const fixture = (requestBody, dbSavedDoc, throwException, reason) => {
            res.locals.oas.body = requestBody;
            req.file = requestBody.Avatar ? { publicUrl: "http://someUrl.com"} : null;
            breaker = mocks.circuitBreaker(throwException, reason).fire("save", dbSavedDoc);
        }

        beforeEach(() => {
            res.locals = { oas: {}}
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it ("Should return 201 when registered successfully", (done) => {
            fixture({ AccountInfo: {username: "test", password: "test"}}, {username: "test"}); // Sice everything is mocked, there is no need to send every field
            register(req, res);
            assertRequest(201, undefined, done);
        });

        it ("Should return 400 when username is invalid", (done) => {
            fixture({ AccountInfo: {username: "test", password: "invalid"}}, null, true, {message: "Account validation failed: password must be at least 8 characters long"});
            register(req, res);
            assertRequest(400, {message: 'Validation error: Account validation failed: password must be at least 8 characters long'}, done);
        });

        it ("Should return 400 when username is already taken", (done) => {
            fixture({ AccountInfo: {username: "test", password: "test"}}, null, true, {message: "duplicate key error. {username} is duplicated."});
            register(req, res);
            assertRequest(400, {message: 'username is duplicated, must be unique'}, done);
        });

        it ("Should return 500 when database fails", (done) => {
            fixture({ AccountInfo: {username: "test", password: "test"}}, null, true, {message: "Connection timeout"});
            register(req, res);
            assertRequest(500, {message: 'Unexpected error ocurred, please try again later'}, done);
        });
    });
});
