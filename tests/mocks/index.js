import serverExports from "../../server.js";
import commons from "../../utils/commons.js";
import { CircuitBreaker } from "../../utils/circuitBreaker.js";
import { stub } from 'sinon';
import jwt from "jsonwebtoken";

export default {
    circuitBreaker,
    signToken,
    jwtSign,
    jwtDecode,
    fileRef,
}

function circuitBreaker(throwException = false, reason) {
    return {
        fire : (fireFuncName, result) => stub(CircuitBreaker, "getBreaker").returns({
                fire: (fname, ...args) => throwException ? Promise.reject(reason) : Promise.resolve(result)
            })
        }
    }

function signToken() {
    return stub(commons, "signToken").resolves();
}

function fileRef() {
    return stub(serverExports, "fileRef").returns();
}

function jwtSign(token) {
    return stub(jwt, "sign").returns(token);
}

function jwtDecode(payload) {
    return stub(jwt, "decode").returns(payload);
}