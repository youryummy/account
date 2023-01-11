import { CircuitBreaker } from "./circuitBreaker.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import _ from "lodash";

const secret = process.env.JWT_SECRET ?? "testsecret";
const issuer = process.env.JWT_ISSUER ?? "youryummy";
const domain = process.env.COOKIE_DOMAIN ?? 'localhost';

export async function signToken(req, res, payload) {
    const tokenAttr = ["username", "plan", "role"]
    
    const secure = domain ? 'Secure;' : ';';
    const oldToken = req.headers.cookie?.match(/(?<=authToken=)[^;\s]*/)?.[0];
    const data = _.merge(oldToken ? _.pick(jwt.decode(oldToken), tokenAttr) : {}, _.pick(payload, tokenAttr));
    
    //Add attributes from other services to data
    data.userId = data.username;
    data.ingredientsIds = await CircuitBreaker.getBreaker(axios, res, {onlyOpenOnInternalError: true}).fire("get", `http://youryummy-ingredients-service/api/v1/ingredients`).then((res) => res.data.map((ing) => ing.creado_por).filter((acc) => acc === data.username)).catch(() => []);
    data.recipebookIds = await CircuitBreaker.getBreaker(axios, res, {onlyOpenOnInternalError: true}).fire("get", `http://youryummy-recipesbook-service/api/v1/recipesbooks/findByUserId/${data.username}`).then((res) => res.data.map((rb) => rb.idUser)).catch(() => []);
    data.ratingIds = await CircuitBreaker.getBreaker(axios, res, {onlyOpenOnInternalError: true}).fire("get", `http://youryummy-ratings-service/api/v1/ratings/findByUserId/${data.username}`).then((res) => res.data.map((rating) => rating.idUser)).catch(() => []);
    data.eventIds = await CircuitBreaker.getBreaker(axios, res, {onlyOpenOnInternalError: true}).fire("get", `http://planner/api/v1/events`).then((res) => res.data.map((event) => event.account).filter((acc) => acc === data.username)).catch(() => []);
    data.recipeIds = await CircuitBreaker.getBreaker(axios, res, {onlyOpenOnInternalError: true}).fire("get", `http://recipes/api/v1/recipes`).then((res) => res.data.map((recipe) => recipe.userId).filter((acc) => acc === data.username)).catch(() => []);

    const newToken = jwt.sign(data, secret, {issuer: issuer, expiresIn: '24h' });
    
    res.setHeader('Set-Cookie', `authToken=${newToken}; HttpOnly; ${secure} Max-Age=${60 * 60 * 24}; Path=/; Domain=${domain}`);
}

export default { signToken };
