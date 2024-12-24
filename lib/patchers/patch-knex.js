const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");

/**
 * Example logger for demonstration.
 * Replace this with your own logic or a real logger instance.
 */
const loggerInstance = {
  logQuery(info) {
    console.log("[Patch knex]", info);
  },
};

/**
 * We'll try to patch a commonly used internal method on Knex's Client prototype:
 * - For many dialects, the final query is handled by `Client.prototype._query()` or `.query()`.
 * - This can vary by Knex version and dialect. For example, MySQL vs. Postgres clients might differ.
 * - You may need to adjust for your specific version or dialect if `_query` isn't present.
 */
Hook(["knex"], function (exports, name, basedir) {
  // Check if we have a Knex Client base class to patch
  if (!exports || !exports.Client || !exports.Client.prototype) {
    console.warn("[Patch knex] Could not find Client prototype. Patch may not work.");
    return exports;
  }

  // Attempt to patch `_query` if it exists (common internal method)
  if (typeof exports.Client.prototype._query === "function") {
    shimmer.wrap(exports.Client.prototype, "_query", function (originalQuery) {
      return async function patchedQuery(obj) {
        // `obj` often contains { sql, bindings } or similar
        loggerInstance.logQuery({
          dialect: this.config && this.config.client, // The configured dialect name
          sql: obj.sql,
          bindings: obj.bindings,
          timestamp: new Date(),
        });

        // Call the original _query method
        return originalQuery.apply(this, arguments);
      };
    });
    console.log("[Patch knex] Client.prototype._query patched successfully.");
  } else if (typeof exports.Client.prototype.query === "function") {
    // If `_query` doesn't exist, try patching `.query()` instead
    shimmer.wrap(exports.Client.prototype, "query", function (originalQuery) {
      return async function patchedQuery(connection, obj) {
        // `obj` typically has { sql, bindings } or is a raw query string
        loggerInstance.logQuery({
          dialect: this.config && this.config.client,
          sql: obj && obj.sql ? obj.sql : obj,
          bindings: obj && obj.bindings,
          timestamp: new Date(),
        });

        return originalQuery.apply(this, arguments);
      };
    });
    console.log("[Patch knex] Client.prototype.query patched successfully.");
  } else {
    console.warn("[Patch knex] No suitable query method found to patch.");
  }

  // Return the patched Knex module
  return exports;
});
