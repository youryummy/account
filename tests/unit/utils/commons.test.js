import { signToken } from '../../../utils/commons.js';
import { strict as assert } from 'node:assert';
import mocks from '../../mocks/index.js';

export default () => {
    let breaker;
    const res = { headers: {} }, req = { headers: {}};
    describe("JWT token signtature tests", () => {
        const payload = { username: "test", plan: "test", role: "test", userId: "test" };
        const token = "EncodedtokenDependingOnThePayload";
        const secret = "testsecret";
        const issuer = "youryummy";

        before(() => {
            res.setHeader = (key, val) => res.headers[key] = val;
            breaker = mocks.circuitBreaker().fire("get", {data: {result: []}});
        });

        beforeEach(() => {
            res.headers = {};
            req.headers = {};
        });

        after(() => {
            delete process.env.JWT_SECRET;
            delete process.env.JWT_ISSUER;
            breaker.restore();
        });

        it("Should sign the token and write Set-Cookie header", (done) => {
            let signMock = mocks.jwtSign(token, payload);
            
            signToken(req, res, payload).then(() => {
                assert.equal(signMock.calledWith({...payload, ingredientsIds: [], recipeIds: [], recipebookIds: [], ratingIds: {result: []} }, secret, {issuer, expiresIn: '24h'}), true);
                assert.deepStrictEqual(res.headers, { 'Set-Cookie': `authToken=${token}; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=localhost` });
                done();
            }).catch(err => done(err))
            .finally(() => signMock.restore());
            
        });

        it("Should update the token in case that a previous one existed", (done) => {
            const updatedPayload = { username: "test", plan: "updatedPlan", role: "updatedRole" }
            req.headers.cookie = `tokenString`; // Decode function is mocked, no need to specify full string

            let decodeMock = mocks.jwtDecode(payload);
            let signMock = mocks.jwtSign("newToken");

            signToken(req, res, updatedPayload).then(() => {
                assert.equal(signMock.calledWith({...updatedPayload, userId: "test", ingredientsIds: [], recipeIds: [], recipebookIds: [], ratingIds: {result: []} }, secret, {issuer, expiresIn: '24h'}), true);
                assert.deepStrictEqual(res.headers, { 'Set-Cookie': 'authToken=newToken; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=localhost' });
                done();
            }).catch(err => done(err))
            .finally(() => {
                signMock.restore();
                decodeMock.restore();
            });
            
        });
    });
}
