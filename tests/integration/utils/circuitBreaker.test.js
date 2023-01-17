import { getAccounts, findByusername } from '../../../controllers/accountManager.js';
import { CircuitBreaker } from '../../../utils/circuitBreaker.js';
import Account from '../../../mongo/Account.js';
import { strict as assert } from 'node:assert';
import mongoose from "mongoose";

export default () => {

    // Auxiliar functions
    const req = {}, res = {};
    let breaker;
    const assertRequest = (expectedCode, expectedData, breakerState, done, aggFunction = (arg) => arg) => {
        res.send = (data) => { 
            try {
                switch (breakerState) {
                    case "closed":
                        assert.deepStrictEqual(breaker.closed, true); break;
                    case "opened":
                        assert.deepStrictEqual(breaker.opened, true); break;
                    case "half-open":
                        assert.deepStrictEqual(breaker.halfOpen, true); break;
                }
                assert.deepStrictEqual(aggFunction(data), expectedData);
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
    
    describe("CircuitBreaker DB integration tests", () => {
        before(() => {
            res.locals = { oas: {} };
            CircuitBreaker.resetAll();
            breaker = CircuitBreaker.getBreaker(Account, res, {onlyOpenOnInternalError: true, resetTimeout: 3000}); // pre-create the breaker
            return mongoose.disconnect();
        });

        after(() => {
            CircuitBreaker.resetAll();
            return mongoose.connect("mongodb://localhost:27017/test");
        });

        it("Should return 404 if object not found in DB (query succeeds). Breaker state should be closed", (done) => {
            mongoose.connect("mongodb://localhost:27017/test").then(() => {
                res.locals.oas.params = { username: "testNotFound"};
                findByusername(req, res);
                assertRequest(404, { message: "Account with username 'testNotFound' does not exist" }, "closed", (err) => {
                    mongoose.disconnect().then( () => done(err)) 
                });
            });
        });

        it("Should throw an error if DB connection is closed (query failed). Breaker state should remain closed", (done) => {
            getAccounts(req, res);
            assertRequest(500, { message: "Unexpected error ocurred, please try again later" }, "closed", done);
        });

        it("Should throw an error if DB connection is closed (query failed). Breaker state should open due to failing more than 50% of requests", (done) => {
            getAccounts(req, res);
            assertRequest(500, { message: "Unexpected error ocurred, please try again later" }, "opened", done);
        });

        it("Should return 404 if object not found in DB (query succeeds). Breaker should reset after 3s and set state to half open", (done) => {
            // Wait for the breaker to reset
            setTimeout(() => {
                mongoose.connect("mongodb://localhost:27017/test").then(() => {
                    res.locals.oas.params = { username: "testNotFound"};
                    findByusername(req, res);
                    assertRequest(404, { message: "Account with username 'testNotFound' does not exist" }, "halfOpen", (err) => {
                        mongoose.disconnect().then(() => done(err)) 
                    });
                });
            }, 3000);
        });

        it("Should return 200 when object found in DB (query succeeds). Breaker state should be set to closed", (done) => {
            mongoose.connect("mongodb://localhost:27017/test").then(() => {
                res.locals.oas.params = { username: "test"};
                findByusername(req, res);
                assertRequest( 200, "test", "closed", 
                    (err) => mongoose.disconnect().then(() => done(err)),
                    (data) => data.username
                );
            });   
        });

    });
}