import { signToken } from '../../../utils/commons.js';
import { strict as assert } from 'node:assert';
import mocks from '../../mocks/index.js';

export default () => {
    const res = { headers: {} }, req = { headers: {}};
    describe("JWT token signtature tests", () => {
        const payload = { username: "test", plan: "test", role: "test" };
        const token = "EncodedtokenDependingOnThePayload";
        const secret = "testsecret";
        const issuer = "youryummy";

        before(() => {
            res.setHeader = (key, val) => res.headers[key] = val;
        });

        beforeEach(() => {
            res.headers = {};
            req.headers = {};
        });

        after(() => {
            delete process.env.JWT_SECRET;
            delete process.env.JWT_ISSUER;
        });

        it("Should sign the token and write Set-Cookie header", () => {
            let signMock = mocks.jwtSign(token, payload);
            
            signToken(req, res, payload);
            
            assert.equal(signMock.calledWith(payload, secret, {issuer, expiresIn: '24h'}), true);
            assert.deepStrictEqual(res.headers, { 'Set-Cookie': `authToken=${token}; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=localhost` });

            signMock.restore();
        });

        it("Should update the token in case that a previous one existed", () => {
            const updatedPayload = { username: "updatedUser", plan: "updatedPlan", role: "updatedRole" }
            req.headers.cookie = `tokenString`; // Decode function is mocked, no need to specify full string

            let decodeMock = mocks.jwtDecode(payload);
            let signMock = mocks.jwtSign("newToken");

            signToken(req, res, updatedPayload);
            
            assert.equal(signMock.calledWith(updatedPayload, secret, {issuer, expiresIn: '24h'}), true);
            assert.deepStrictEqual(res.headers, { 'Set-Cookie': 'authToken=newToken; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=localhost' });

            signMock.restore();
            decodeMock.restore();
        });
    });
}
