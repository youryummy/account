import commons from "../../utils/commons.js";
import { CircuitBreaker } from "../../utils/circuitBreaker.js";
import { stub } from 'sinon';

export default {
    circuitBreaker,
    signToken
}

function circuitBreaker(throwException = false, reason) {
    return {
        fire : (fireFuncName, result) => stub(CircuitBreaker, "getBreaker").returns({
                fire: (fname, ...args) => throwException ? Promise.reject(reason) : Promise.resolve(result)
            })
        }
    }

function signToken() {
    return stub(commons, "signToken").returns();
}