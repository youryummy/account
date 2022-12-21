import jwt from "jsonwebtoken";
import _ from "lodash";

const secret = process.env.JWT_SECRET ?? "testsecret";
const issuer = process.env.JWT_ISSUER ?? "youryummy";
const domain = process.env.COOKIE_DOMAIN ?? 'localhost';

export function signToken(req, res, payload) {
    // TODO add attributes from other services
    const tokenAttr = ["username", "plan", "role"]
    
    const secure = domain ? 'Secure;' : ';';
    const oldToken = req.headers.cookie?.match(/(?<=authToken=)[^;\s]*/)?.[0];
    const data = _.merge(oldToken ? _.pick(jwt.decode(oldToken), tokenAttr) : {}, _.pick(payload, tokenAttr));
    const newToken = jwt.sign(data, secret, {issuer: issuer, expiresIn: '24h' });
    
    res.setHeader('Set-Cookie', `authToken=${newToken}; HttpOnly; ${secure} Max-Age=${60 * 60 * 24}; Path=/; Domain=${domain}`);
}