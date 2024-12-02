/** @format */

import React from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface CacheResponse {
  uuid: number;
  content: {
    key: string;
    value: string;
    time: string;
    type: number;
    port: number;
    db: string;
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/cache/${params.cacheId}`);
  const cache = await data.json();
  return { cache };
}

export default function CachePreview() {
  const { cache } = useLoaderData() as { cache: CacheResponse };
  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>Cache Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(cache.content.time).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(cache.content.time)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Key</div>
              <div className="col-span-8">{cache.content.key}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Value</div>
              <div className="col-span-8">
                <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                  {cache.content.value}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Type</div>
              <div className="col-span-8">{cache.content.type}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">DB</div>
              <div className="col-span-8">{cache.content.db}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Port</div>
              <div className="col-span-8">{cache.content.port}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
