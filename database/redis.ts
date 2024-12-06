/** @format */

import { createClient } from "redis";

export default (async function () {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  return client;
})();
