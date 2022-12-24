import { CircuitBreaker } from '../../../utils/circuitBreaker.js';
import { strict as assert } from 'node:assert';

export default () => {
    let breaker, breakerNameOverride;

    class SUTClass {
        static async SUTFunction (fail = false) {
            if (fail) throw new Error("CircuitBreaker test error");
            else return "Ok";
        }
    }
 
    describe("CircuitBreaker tests", () => {
        beforeEach(() => {
            breaker = CircuitBreaker.getBreaker(SUTClass);
            breakerNameOverride = CircuitBreaker.getBreaker(SUTClass, "SUTClassOverride");
        });

        it("Should execute async function correctly", async () => {
            const result1 = await breaker.fire("SUTFunction");
            const result2 = await breakerNameOverride.fire("SUTFunction");

            assert.equal(result1, "Ok");
            assert.equal(result2, "Ok");
        });

        it("Should execute and fail the function being the current fail rate < 50%", async () => {
            const result1 = breaker.fire("SUTFunction", true);
            const result2 = await breakerNameOverride.fire("SUTFunction");

            await assert.rejects(result1, { name: "Error", message: "CircuitBreaker test error" });
            assert.equal(result2, "Ok");
        });

        it("Should execute and fail the function being the current fail rate = 50% so the next fail triggers the breaker", async () => {
            const result1 = breaker.fire("SUTFunction", true);
            const result2 = breakerNameOverride.fire("SUTFunction", true);

            await assert.rejects(result1, { name: "Error", message: "CircuitBreaker test error" });
            await assert.rejects(result2, { name: "Error", message: "CircuitBreaker test error" });
        });

        it("Should open the circuit when failing for the third time (current rate % > 50% thresold) being independent when name is overriden", async () => {
            const result1 = breaker.fire("SUTFunction", true);
            const result2 = breakerNameOverride.fire("SUTFunction", true);

            await assert.rejects(result1, { name: "Error", message: "Breaker is open" });
            await assert.rejects(result2, { name: "Error", message: "CircuitBreaker test error" });
        });
    });
}