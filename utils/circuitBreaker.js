import OpossumCircuitBreaker from "opossum";

const defaults = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
};

// Store CB instances by name
const breakers = {}

// Wrapper class
export class CircuitBreaker extends OpossumCircuitBreaker {
    constructor (object, opts) {
        super((fname, ...args) => object[fname](...args), opts ?? defaults);
    }

    static getBreaker(object, res, {nameOverride, onlyOpenOnInternalError, ...opts} = {}) {
        let name = nameOverride ?? (object.constructor.name);
        if (!breakers[name]) {
            breakers[name] = new CircuitBreaker(object, {...opts});
            if (onlyOpenOnInternalError) {
                breakers[name].once("open", () => {
                    res.status = (code) => {
                        if (code !== 500) breakers[name].close();
                        res.statusCode = code;
                        return res;
                    }
                })
            }
        };
        return breakers[name];
    }

    static resetAll() {
        for (let name in breakers) {
            delete breakers[name];
        }
    }

    fire(fname, ...args) {
        return super.fire(fname, ...args);
    }
}