/** @format */

import React from "react";
import { Link, useLoaderData } from "react-router-dom";
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

export async function loader() {
  const data = await fetch("/api/data/queries");
  const queries = await data.json();
  return { queries };
}

export default function QueriesIndex() {
  const { queries } = useLoaderData() as { queries: QueryResponse[] };

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span className="font-medium">Queries</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] gap-1 px-4 py-3 font-medium text-sm">
          <span className="col-span-2">Host</span>
          <span className="col-span-2">Port</span>
          <span className="col-span-1">User</span>
          <span className="col-span-4">Query</span>
          <span className="col-span-1">DB</span>
          <span className="col-span-1">Time</span>
          <span className="col-span-1"></span>
        </div>
        <table className="w-full">
          <tbody>
            {queries.map((query) => (
              <tr
                key={query.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4 text-sm gap-1 border-t border-neutral-200"
              >
                <td className="col-span-2">
                  <span className="font-medium px-2 py-1 rounded-md">
                    {query.content.host}
                  </span>
                </td>
                <td className="col-span-2">{query.content.port}</td>
                <td className="col-span-1">{query.content.user}</td>
                <td className="col-span-4">{query.content.query}</td>
                <td className="col-span-1">{query.content.database}</td>
                <td className="col-span-1">{timeAgo(query.content.time)}</td>
                <td className="col-span-1 ml-auto">
                  <Link to={`${query.uuid}`} state={{ queryId: query.uuid }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="#D1D5DA"
                      className="hover:fill-[#000]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
