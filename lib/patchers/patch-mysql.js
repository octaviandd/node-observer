const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

/**
 * Example logger for demonstration.
 * Replace or expand this with your own logging/instrumentation logic.
 */
const loggerInstance = {
  logQuery: (info) => {
    console.log("[Patch mysql]", info);
  },
};

/**
 * Hook the "mysql" module so that when it's first required,
 * we can patch its connection and pool creation methods.
 */
Hook(["mysql"], function (exports, name, basedir) {
  // MySQL provides createConnection, createPool, createPoolCluster, etc.
  // We'll patch the prototypes of Connection and Pool to intercept "query" calls.

  // 1) Patch createConnection
  shimmer.wrap(exports, "createConnection", function (originalCreateConnection) {
    return function patchedCreateConnection(...args) {
      const connection = originalCreateConnection.apply(this, args);

      // Patch the 'query' method on the returned connection
      patchConnectionQuery(connection, "Connection");

      return connection;
    };
  });
  console.log("[Patch mysql] createConnection patched.");

  // 2) Patch createPool
  shimmer.wrap(exports, "createPool", function (originalCreatePool) {
    return function patchedCreatePool(...args) {
      const pool = originalCreatePool.apply(this, args);

      // Patch the 'query' method on the pool
      patchPoolQuery(pool, "Pool");

      return pool;
    };
  });
  console.log("[Patch mysql] createPool patched.");

  // 3) If you also need to patch createPoolCluster, do so similarly
  if (typeof exports.createPoolCluster === "function") {
    shimmer.wrap(exports, "createPoolCluster", function (originalCreatePoolCluster) {
      return function patchedCreatePoolCluster(...args) {
        const poolCluster = originalCreatePoolCluster.apply(this, args);

        // Each pool in the cluster can be patched when acquired.
        // For example, poolCluster.of(...).getConnection(...) or .query(...) calls.
        // The exact approach depends on your usage. You can also patch the .of(...) method if needed.

        console.log("[Patch mysql] createPoolCluster patched.");
        return poolCluster;
      };
    });
  }

  // Return the patched mysql module
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
      // e.g. query(sql, callback) or query(sql, values, callback)
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
  console.log(`[Patch mysql] ${contextName}.query patched.`);
}

/**
 * Patch the query method on a Pool object.
 */
function patchPoolQuery(pool, contextName) {
  if (!pool || typeof pool.query !== "function") return;

  shimmer.wrap(pool, "query", function (originalQuery) {
    return function patchedPoolQuery(sql, values, cb) {
      loggerInstance.logQuery({
        context: contextName,
        sql,
        values,
        timestamp: new Date(),
      });

      return originalQuery.apply(this, arguments);
    };
  });
  console.log(`[Patch mysql] ${contextName}.query patched.`);
}
