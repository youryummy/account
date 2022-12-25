import { login, register } from "../../../controllers/credentialManager.js";
import { CircuitBreaker} from "../../../utils/circuitBreaker.js"
import Account from "../../../mongo/Account.js";
import { strict as assert } from 'node:assert';

// Auxiliar functions
const req = {}, res = {}; 
const assertRequest = (expectedCode, expectedData, done) => {
    res.send = (data) => { 
        try {
            if (res.headers["Set-Cookie"]) assert.equal(res.headers["Set-Cookie"].includes("authToken"), true);
            assert.deepStrictEqual(data, expectedData); 
            done(); 
        } catch(err) {
            done(err);
        }
    }
    res.status = (code) => { 
        try {
            assert.deepStrictEqual(code, expectedCode); 
            return res; 
        } catch(err) { 
            res.send = () => done(err);
            return res;
        }
    };
}

// TEST SUITE
describe("Credential manager tests", () => {
    
    before(() => {
        res.setHeader = (key, val) => res.headers[key] = val;
    });

    after(() => {
        CircuitBreaker.resetAll();
    });

    /* LOGIN TEST SUITE */
    describe("Login tests", () => {
        
        const fixture = (username, password) => {
            res.locals.oas.body = { username, password };
        }

        beforeEach(() => {
            req.headers = {};
            res.headers = {};
            res.locals = { oas: {}};
        });

        // TESTS
        it("Should return 201 and set authToken cookie when logged in successfully", (done) => {
            fixture("test", "Test1234");
            login(req, res);
            assertRequest(201, undefined, done);
        });

        it("Should return 400 when username is invalid", (done) => {
            fixture("InvalidUser", "test");
            login(req, res);
            assertRequest(400, {message: 'Invalid username or password'}, done);
        });

        it("Should return 400 when password is invalid", (done) => {
            fixture("test", "InvalidPassword");
            login(req, res);
            assertRequest(400, {message: 'Invalid username or password'}, done);
        });
    });

    /* REGISTER TEST SUITE */
    describe("Register tests", () => {
        const fixture = (requestBody) => {
            res.locals.oas.body = requestBody;
            req.file = requestBody.Avatar ? { publicUrl: "http://someUrl.com"} : null;
        }
        
        beforeEach(() => {
            res.locals = { oas: {}}
        });

        after(() => {
            return Account.deleteOne({username: "testNoDup"});
        });

        // TESTS
        it ("Should return 201 when registered successfully", (done) => {
            fixture({ AccountInfo: {username: "testNoDup", password: "Test1234", fullName: "test", birthDate: "1990-01-01", email: "testNoDup@example.com"}});
            register(req, res);
            assertRequest(201, undefined, done);
        });

        it ("Should return 400 when username is duplicated", (done) => {
            fixture({ AccountInfo: {username: "test", password: "test", fullName: "test", birthDate: "1990-01-01", email: "testNoDup@example.com"}});
            register(req, res);
            assertRequest(400, {message: "username: 'test' is duplicated, must be unique"}, done);
        });

        it ("Should return 400 when email is duplicated", (done) => {
            fixture({ AccountInfo: {username: "testNoDup2", password: "test", fullName: "test", birthDate: "1990-01-01", email: "test@example.com"}});
            register(req, res);
            assertRequest(400, {message: "email: 'test@example.com' is duplicated, must be unique"}, done);
        });

        it ("Should return 400 when birthdate is after current date", (done) => {
            fixture({ AccountInfo: {username: "testNoDup2", password: "test", fullName: "test", birthDate: "2090-01-01", email: "testNoDup2@example.com"}});
            register(req, res);
            assertRequest(400, {message: "Validation error: Account validation failed: birthDate: Invalid birth date. Must input a valid Date prior to the current date."}, done);
        });

        it ("Should return 400 when cellphone has invalid format", (done) => {
            fixture({ AccountInfo: {username: "testNoDup2", password: "test", cellPhone: "Invalid", fullName: "test", birthDate: "1990-01-01", email: "testNoDup2@example.com"}});
            register(req, res);
            assertRequest(400, {message: "Validation error: Account validation failed: cellPhone: Invalid phone number"}, done);
        });
    });
});
