const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

/**
 * A mapping of LRU Cache methods to their argument names.
 * Extend or modify as needed.
 */
const commandArgsMapping = {
  get: ["key"],
  set: ["key", "value"],
  has: ["key"],
};

/**
 * Hook 'lru-cache' so that the first time it's required, we can patch the LRU class.
 */
Hook(["lru-cache"], function (exports, name, basedir) {
  // The `exports` is the constructor (class) returned by `require("lru-cache")`.
  // We'll patch its prototype to intercept `get`, `set`, `has`, etc.
  if (!exports || !exports.prototype) {
    console.warn("[Patch lru-cache] Could not locate exports.prototype to patch.");
    return exports;
  }

  Object.keys(commandArgsMapping).forEach((method) => {
    if (typeof exports.prototype[method] === "function") {
      shimmer.wrap(exports.prototype, method, function (originalFn) {
        return function patchedMethod(...args) {
          // Build a log object
          const argNames = commandArgsMapping[method];
          const logContent = {
            time: new Date(),
            type: method,
            package: "lru-cache",
          };

          // Map arguments to their names
          argNames.forEach((argName, index) => {
            logContent[argName] = args[index];
          });

          if (method === "get") {
            // If you want to capture the return value from `get`:
            const result = originalFn.apply(this, args);
            logContent["result"] = result;
            watchers.cache.addContent(logContent);
            return result;
          } else {
            // For set, has, or others, just log the call
            watchers.cache.addContent(logContent);
            return originalFn.apply(this, args);
          }
        };
      });
      console.log(`[Patch lru-cache] Patched method: ${method}`);
    }
  });

  // Return the patched constructor
  return exports;
});
