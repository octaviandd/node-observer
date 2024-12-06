/** @format */

import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface CacheResponse {
  uuid: number;
  content: {
    key: string;
    value: string;
    time: string;
    type: number;
    port: number;
    stdTTL: string;
  };
}

export async function loader() {
  const data = await fetch("/api/data/cache");
  const caches = await data.json();
  return { caches };
}

export default function CacheIndex() {
  const { caches } = useLoaderData() as { caches: CacheResponse[] };

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span className="font-medium">Cache</span>
      </div>
      <div>
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] px-4 py-3 font-semibold text-sm gap-1">
          <span className="col-span-2">Key</span>
          <span className="col-span-5">Value</span>
          <span className="col-span-1">Type</span>
          <span className="col-span-1">Time to live</span>
          <span className="col-span-2">Happened</span>
          <span className="col-span-1"></span>
        </div>
        <table className="w-full">
          <tbody>
            {caches.map((cache) => (
              <tr
                key={cache.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4 text-sm gap-1 border-t border-neutral-200"
              >
                <td className="col-span-2">
                  <span className="font-medium px-2 py-1 rounded-md">
                    {cache.content.key}
                  </span>
                </td>
                <td className="col-span-5">{cache.content.value}</td>
                <td className="col-span-1">{cache.content.type}</td>
                <td className="col-span-1">{cache.content.stdTTL}s</td>
                <td className="col-span-2">{timeAgo(cache.content.time)}</td>
                <td className="col-span-1 ml-auto">
                  <Link to={`${cache.uuid}`} state={{ cacheId: cache.uuid }}>
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
