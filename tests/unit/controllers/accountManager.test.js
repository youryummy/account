import { getAccounts, deleteAccount, findByusername, updateAccount } from '../../../controllers/accountManager.js';
import { strict as assert } from 'node:assert';
import mocks from "../../mocks/index.js";

// Auxiliar functions
const req = {}, res = {setHeader: () => {}}, mocklist = []; 
const assertRequest = (expectedCode, expectedData, done) => {
    res.send = (data) => { 
        try {
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
            if (code >= 400) done(err);
            else res.status = () => done(err);
        }
    };
}

// TEST SUITE
describe("Account manager tests", () => {
    before(() => {
        mocklist.push(mocks.fileRef());
        mocklist.push(mocks.signToken());
    });

    after(() => {
        while (mocklist.length > 0) {
            mocklist.pop().restore();
        }
    });

    describe("GET Accounts tests", () => {
        let breaker;
        const fixture = (dbResponse, throwException = false) => {
            breaker = mocks.circuitBreaker(throwException, "Circuit is open").fire("find", dbResponse);
        }

        beforeEach(() => {
            res.locals = { oas: {}}
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it("Should return 200 when users found in DB", (done) => {
            fixture([{ username: "test", password: "test", birthDate: new Date("1990-01-01") }]);
            getAccounts(req, res);
            assertRequest(200, [{username: "test", birthDate: "1990-01-01"}], done);
        });

        it("Should return 200 with empty list when no users found in DB", (done) => {
            fixture([]);
            getAccounts(req, res);
            assertRequest(200, [], done);
        });

        it("Should return 500 when DB fails", (done) => {
            fixture([], true);
            getAccounts(req, res);
            assertRequest(500, { message: "Unexpected error ocurred, please try again later" }, done);
        });
    });

    describe("GET Account tests (FIND)", () => {
        let breaker;
        const fixture = (username, dbResponse, throwException = false) => {
            res.locals.oas.params = { username }
            breaker = mocks.circuitBreaker(throwException, "Circuit is open").fire("findOne", dbResponse);
        }

        beforeEach(() => {
            res.locals = { oas: {}}
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it("Should return 200 when user found in DB", (done) => {
            fixture("test", { username: "test", password: "test", birthDate: new Date("1990-01-01") });
            findByusername(req, res);
            assertRequest(200, { username: "test", birthDate: "1990-01-01" }, done);
        });

        it("Should return 404 when user not found in DB", (done) => {
            fixture("test", undefined);
            findByusername(req, res);
            assertRequest(404, {message: `Account with username '${res.locals.oas.params.username}' does not exist`}, done);
        });

        it("Should return 500 when DB fails", (done) => {
            fixture("test", null, true);
            findByusername(req, res);
            assertRequest(500, { message: "Unexpected error ocurred, please try again later" }, done);
        });
    });

    describe("PUT Account tests", () => {
        let breaker;
        const fixture = (username, body, dbResponse, throwException = false, reason) => {
            res.locals.oas.params = username;
            res.locals.oas.body = { AccountInfo: body };
            breaker = mocks.circuitBreaker(throwException, reason).fire("findOneAndUpdate", dbResponse);
        }

        beforeEach(() => {
            res.locals = { oas: {}}
            req.file = null;
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it("Should return 204 when user updated successfully", (done) => {
            fixture("oldTest", { username: "test" }, { username: "test" });
            updateAccount(req, res);
            assertRequest(204, undefined, done);
        });

        it("Should return 400 when attempt to modify username", (done) => {
            fixture("oldTest", { username: "test" }, { username: "oldTest" });
            updateAccount(req, res);
            assertRequest(400, {message: "Username cannot be modified"}, done);
        });

        it("Should return 404 when user does not exist", (done) => {
            fixture("oldTest", { username: "test" }, null);
            updateAccount(req, res);
            assertRequest(404, {message: `Account with username '${res.locals.oas.params.username}' does not exist`}, done);
        });

        it("Should return 400 when validation error is thrown", (done) => {
            fixture("oldTest", { username: "test" }, null, true, { message: "Account validation failed: password must be 8 characters long" });
            updateAccount(req, res);
            assertRequest(400, {message: `Validation error: Account validation failed: password must be 8 characters long`}, done);
        });

        it("Should return 400 when duplicated key is found", (done) => {
            fixture("oldTest", { username: "test" }, null, true, {message: "duplicate key error. {username} is duplicated."});
            updateAccount(req, res);
            assertRequest(400, {message: 'username is duplicated, must be unique'}, done);
        });

        it("Should return 500 when database fails", (done) => {
            fixture("oldTest", { username: "test" }, null, true, {message: "Circuit is open"});
            updateAccount(req, res);
            assertRequest(500, {message: 'Unexpected error ocurred, please try again later'}, done);
        });
    });

    describe("DELETE Account tests", () => {
        let breaker;
        const fixture = (username, dbResponse, throwException = false, reason) => {
            res.locals.oas.params = username;
            breaker = mocks.circuitBreaker(throwException, reason).fire("findOneAndDelete", dbResponse);
        }

        beforeEach(() => {
            res.locals = { oas: {}}
            req.file = null;
        });

        afterEach(() => {
            breaker?.restore();
        });

        // TESTS
        it("Should return 204 when user is deleted successfully", (done) => {
            fixture("test", { username: "test", delete: () => {} });
            deleteAccount(req, res);
            assertRequest(204, undefined, done);
        });

        it("Should return 204 when user does not exist", (done) => {
            fixture("test", undefined);
            deleteAccount(req, res);
            assertRequest(204, undefined, done);
        });

        it("Should return 500 when database fails", (done) => {
            fixture("test", null, true, {message: "Circuit is open"});
            deleteAccount(req, res);
            assertRequest(500, {message: 'Unexpected error ocurred, please try again later'}, done);
        });
    });
});