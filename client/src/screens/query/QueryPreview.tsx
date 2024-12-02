/** @format */

import React from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface QueryResponse {
  uuid: number;
  content: {
    host: string;
    port: number;
    time: string;
    user: string;
    query: string;
    database: string;
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/queries/${params.queryId}`);
  const query = await data.json();
  return { query };
}

export default function QueryPreview() {
  const { query } = useLoaderData() as { query: QueryResponse };
  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>Query Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(query.content.time).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(query.content.time)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Host</div>
              <div className="col-span-8">{query.content.host}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Port</div>
              <div className="col-span-8">
                <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                  {query.content.port}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">User</div>
              <div className="col-span-8">{query.content.user}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">DB</div>
              <div className="col-span-8">{query.content.database}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">query</div>
              <div className="col-span-8">{query.content.query}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
