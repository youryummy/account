import { getAccounts, deleteAccount, findByusername, updateAccount } from '../../../controllers/accountManager.js';
import { CircuitBreaker } from '../../../utils/circuitBreaker.js';
import Account from '../../../mongo/Account.js';
import { strict as assert } from 'node:assert';

// Auxiliar functions
const req = {}, res = {}; 
const assertRequest = (expectedCode, expectedData, done, aggFunction) => {
    res.send = (data) => { 
        try {
            assert.deepStrictEqual(aggFunction ? aggFunction(data) : data, expectedData); 
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
        res.setHeader = (key, val) => res.headers[key] = val;
    });

    after(() => {
        CircuitBreaker.resetAll();
    });

    describe("GET Accounts tests", () => {
        beforeEach(() => {
            res.locals = { oas: {}}
        });

        // TESTS
        it("Should return 200 when users found in DB", (done) => {
            getAccounts(req, res);
            assertRequest(200, 8, done, (data) => data.length);
        });
    });

    describe("GET Account tests (FIND)", () => {
        const fixture = (username) => {
            res.locals.oas.params = { username }
        }

        beforeEach(() => {
            res.locals = { oas: {}}
        });

        // TESTS
        it("Should return 200 when user found in DB", (done) => {
            fixture("test");
            findByusername(req, res);
            assertRequest(200, "test", done, (data) => data?.username);
        });

        it("Should return 404 when user not found in DB", (done) => {
            fixture("testNotFound");
            findByusername(req, res);
            assertRequest(404, {message: `Account with username '${res.locals.oas.params.username}' does not exist`}, done);
        });
    });

    describe("PUT Account tests", () => {
        const fixture = (username, body) => {
            res.locals.oas.params = { username };
            res.locals.oas.body = { AccountInfo: body };
        }

        before(() => {
            return Account.create({ username: "modifiableUser", password: "SomePassword100209", fullName: "modifiable user", email: "modifiableemail@example.com", role: "user", plan: "base"})
        });

        beforeEach(() => {
            req.file = null;
            req.headers = {};
            res.headers = {};
            res.locals = { oas: {}};
        });

        after(() => {
            return Account.deleteOne({ username: "modifiableUser" })
        });

        // TESTS
        it("Should return 204 when user updated successfully", (done) => {
            fixture("modifiableUser", { username: "modifiableUser", password: "SomePassword100209", email: "newemail@example.com"});
            updateAccount(req, res);

            const assertDB = (err) => {
                if (err) done(err);
                else {
                    Account
                    .findOne({ username: "modifiableUser" })
                    .then(acc => { 
                        try {
                            assert.equal(acc.email, "newemail@example.com"); done() 
                        } catch(err) { done(err) }
                    });
                }
            };
            assertRequest(204, undefined, assertDB);
        });

        it("Should return 404 when user does not exist", (done) => {
            fixture("notFoundUser", { password: "newPassword1234"});
            updateAccount(req, res);
            assertRequest(404, {message: `Account with username '${res.locals.oas.params.username}' does not exist`}, done);
        });

        it("Should return 400 when validation error is thrown", (done) => {
            fixture("modifiableUser", { email: "invalidemail" });
            updateAccount(req, res);
            assertRequest(400, {message: `Validation error: Validation failed: email: Invalid email address`}, done);
        });

        it("Should return 400 when duplicated key is found", (done) => {
            fixture("modifiableUser", { username: "modifiableUser", email: "" });
            updateAccount(req, res);
            assertRequest(400, {message: "email: 'test@example.com' is duplicated, must be unique"}, done);
        });
    });

    describe("DELETE Account tests", () => {
        const fixture = (username) => {
            res.locals.oas.params = { username };
        }

        before(() => {
            return Account.create({ username: "deletableUser", password: "SomePassword100209", fullName: "deletable user", email: "deletableemail@example.com", role: "user", plan: "base"})
        });

        beforeEach(() => {
            req.file = null;
            req.headers = {};
            res.headers = {};
            res.locals = { oas: {}};
        });

        // TESTS
        it("Should return 204 when user is deleted successfully", (done) => {
            fixture("deletableUser");
            deleteAccount(req, res);

            const assertDB = (err) => {
                if (err) done(err);
                else {
                    Account
                    .findOne({ username: "deletableUser" })
                    .then(acc => { 
                        try {
                            assert.equal(acc, null); done();
                        } catch(err) { done(err) }
                    });
                }
            };

            assertRequest(204, undefined, assertDB);
        });

        it("Should return 204 when user does not exist", (done) => {
            Account.findOne({ username: "deletableUser" }).then(acc => { 
                assert.equal(acc, null); // Make sure it does not exist
                fixture("deletableUser", undefined);
                deleteAccount(req, res);
                assertRequest(204, undefined, done);
            });
        });
    });
});