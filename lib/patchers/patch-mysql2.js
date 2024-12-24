const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const {watchers} = require("../logger");

/**
 * Example logger for demonstration.
 * Replace or expand this with your own logging/instrumentation logic.
 */
const loggerInstance = {
  logQuery: (info) => {
    console.log("[Patch mysql2]", info);
  },
};

/**
 * Hook the "mysql2" module so that when it's first required,
 * we can patch its connection and pool prototypes.
 */
Hook(["mysql2"], function (exports, name, basedir) {
  // MySQL2 provides createConnection, createPool, etc.
  // We'll patch the prototypes of Connection and Pool to intercept "query" calls.

  // 1) Patch createConnection so we can patch the returned connection's prototype
  shimmer.wrap(exports, "createConnection", function (originalCreateConnection) {
    return function patchedCreateConnection(...args) {
      const connection = originalCreateConnection.apply(this, args);

      // Patch the 'query' method on the returned connection
      patchConnectionQuery(connection, "Connection");

      return connection;
    };
  });
  console.log("[Patch mysql2] createConnection patched.");

  // 2) Patch createPool similarly
  shimmer.wrap(exports, "createPool", function (originalCreatePool) {
    return function patchedCreatePool(...args) {
      const pool = originalCreatePool.apply(this, args);

      // Patch the 'query' method on the pool prototype
      // Pools have "pool.query" directly (in mysql2).
      patchPoolQuery(pool, "Pool");

      // Optionally, also patch getConnection or other pool methods if needed
      // so that any returned connections are also patched.

      return pool;
    };
  });
  console.log("[Patch mysql2] createPool patched.");

  // Return the patched mysql2 module
  return exports;
});

/**
 * Patch the query method on a single Connection object.
 */
function patchConnectionQuery(connection, contextName) {
  if (!connection || typeof connection.query !== "function") return;

  shimmer.wrap(connection, "query", function (originalQuery) {
    return function patchedConnectionQuery(sql, values, cb) {
      // The arguments can be flexible:
      // e.g. query(sql [, values], callback)
      watchers.query.addContent({
        context: contextName,
        sql,
        values,
        timestamp: new Date(),
      });

      // Call the original query
      return originalQuery.apply(this, arguments);
    };
  });
  console.log(`[Patch mysql2] ${contextName}.query patched.`);
}

/**
 * Patch the query method on a Pool object.
 */
function patchPoolQuery(pool, contextName) {
  if (!pool || typeof pool.query !== "function") return;

  shimmer.wrap(pool, "query", function (originalQuery) {
    return function patchedPoolQuery(sql, values, cb) {
      watchers.query.addContent({
        context: contextName,
        sql,
        values,
        timestamp: new Date(),
      });
      return originalQuery.apply(this, arguments);
    };
  });
  console.log(`[Patch mysql2] ${contextName}.query patched.`);
}
