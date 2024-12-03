/** @format */

import React, { useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface CacheResponse {
  uuid: number;
  content: {
    key: string;
    value: string;
    time: string;
    type: number;
    stdTTL: number;
    stats: {
      [key: string]: number;
    };
    checkPeriod: number;
    deleteOnExpire: boolean;
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/cache/${params.cacheId}`);
  const cache = await data.json();
  return { cache };
}

export default function CachePreview() {
  const { cache } = useLoaderData() as { cache: CacheResponse };

  const [tabs, setTabs] = useState([
    {
      id: 0,
      title: "Stats",
      active: true,
    },
  ]);
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
                <span className="font-medium py-1 rounded-md">
                  {cache.content.value}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Type</div>
              <div className="col-span-8">{cache.content.type}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time to Live</div>
              <div className="col-span-8">{cache.content.stdTTL}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Check Period</div>
              <div className="col-span-8">{cache.content.checkPeriod}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Delete on Expire</div>
              <div className="col-span-8">
                {String(cache.content.deleteOnExpire)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col shadow-md mt-8">
        <div className="flex items-center gap-x-4">
          <div className="bg-white h-full w-full flex items-center gap-x-10">
            {tabs.map((tab, index) => (
              <span
                onClick={() =>
                  setTabs((prevTabs) =>
                    prevTabs.map((x) => ({
                      ...x,
                      active: x.id === tab.id,
                    }))
                  )
                }
                key={tab.id}
                className={`${
                  tab.active ? "text-[#488641] border-b border-[#488641]" : ""
                } py-3 px-4 cursor-pointer font-medium text-sm`}
              >
                {tab.title}
              </span>
            ))}
          </div>
        </div>
        <div className="">
          <div className="py-4 bg-[#1E1E1E] text-white">
            {tabs[0].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(cache.content.stats).length > 0 ? (
                    Object.entries(cache.content.stats).map(([key, value]) => (
                      <div key={key} className="flex hover:bg-neutral-600">
                        <span>{key}: </span>
                        <span className="text-blue-500 break-all whitespace-pre-wrap">
                          {value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex hover:bg-neutral-600">
                      <span>{"{"} </span>
                      <span className="">{"}"}</span>
                    </div>
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
