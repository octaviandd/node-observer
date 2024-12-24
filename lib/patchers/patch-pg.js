const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");

/**
 * Example logger instance for demonstration.
 * Replace or augment this with your own logging logic.
 */
const logger = {
  logQuery: (info) => {
    console.log("[Patch pg] Query:", info);
  },
};

/**
 * Hook the "pg" module so that the first time `require("pg")` is called,
 * we can patch its exports (Client, Pool, etc.).
 */
Hook(["pg"], function (exports, name, basedir) {
  // 1) Patch the Client prototype (for `new Client(...)`)
  if (exports.Client && exports.Client.prototype) {
    shimmer.wrap(exports.Client.prototype, "query", function (originalQuery) {
      return function patchedClientQuery(...args) {
        // The typical signature is:
        // client.query(text, values, callback)
        // or client.query(text, callback)
        // We'll do minimal parsing below.

        let queryText = args[0];
        let queryValues = null;

        // If second arg is an array, it's likely `values`
        if (Array.isArray(args[1])) {
          queryValues = args[1];
        }

        logger.logQuery({
          method: "Client.query",
          queryText,
          queryValues,
          timestamp: new Date(),
        });

        // Call the original method
        return originalQuery.apply(this, args);
      };
    });
    console.log("[Patch pg] Patched Client.prototype.query");
  }

  // 2) Optionally patch the Pool prototype (for `new Pool(...)`)
  if (exports.Pool && exports.Pool.prototype) {
    shimmer.wrap(exports.Pool.prototype, "query", function (originalQuery) {
      return function patchedPoolQuery(...args) {
        let queryText = args[0];
        let queryValues = null;

        if (Array.isArray(args[1])) {
          queryValues = args[1];
        }

        logger.logQuery({
          method: "Pool.query",
          queryText,
          queryValues,
          timestamp: new Date(),
        });

        return originalQuery.apply(this, args);
      };
    });
    console.log("[Patch pg] Patched Pool.prototype.query");
  }

  // Return the patched module
  return exports;
});
