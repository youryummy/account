import commonsTests from "./commons.test.js";
import circuitBreakerTests from "./circuitBreaker.test.js";

describe("Utility tests", () => {
    commonsTests();
    circuitBreakerTests();
})