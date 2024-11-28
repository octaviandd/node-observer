/** @format */

import React from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

interface RedisResponse {
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

const timeAgo = (time: string) => {
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - new Date(time).getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days == 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours == 1 ? "" : "s"} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes == 1 ? "" : "s"} ago`;
  } else {
    return `${seconds} second${seconds == 1 ? "s" : ""} ago`;
  }
};

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/redis/${params.redisRowId}`);
  const redis = await data.json();
  return { redis };
}

export default function RedisPreview() {
  const { redis } = useLoaderData() as { redis: RedisResponse };
  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>Redis Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(redis.content.time).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(redis.content.time)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Key</div>
              <div className="col-span-8">{redis.content.key}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Value</div>
              <div className="col-span-8">
                <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                  {redis.content.value}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Type</div>
              <div className="col-span-8">{redis.content.type}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">DB</div>
              <div className="col-span-8">{redis.content.db}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Port</div>
              <div className="col-span-8">{redis.content.port}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
