/** @format */

import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import useSWR from "swr";
import { LoaderFunctionArgs } from "react-router-dom";
interface RequestResponse {
  uuid: number;
  content: {
    method: string;
    url: string;
    duration: number;
    status: number;
    timestamp: string;
    hostname: string;
    middleware: string;
    ipAddress: string;
    memoryUsage: {
      heapTotal: number;
      rss: number;
    };
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/requests/${params.requestId}`);
  const request = await data.json();
  return { request };
}

export default function RequestPreview() {
  const { request } = useLoaderData() as { request: RequestResponse };

  console.log(request);

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

  return (
    <div className="flex flex-col shadow-md">
      <div className="">
        <div className="bg-white h-full w-full px-4 py-3">
          <span>Request Details</span>
        </div>
      </div>
      <div className="px-3">
        {/* {isLoading && <div>Loading...</div>}
        {error && <div>Error loading data</div>}
        {data && ( */}
        <div className="flex flex-col gap-y-4 py-4">
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Time</div>
            <div className="col-span-8">
              {new Date(request.content.timestamp).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}{" "}
              ({timeAgo(request.content.timestamp)})
            </div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Hostname</div>
            <div className="col-span-8">{request.content.hostname}</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Method</div>
            <div className="col-span-8">
              <span className="bg-neutral-300 px-3 py-1">
                {request.content.method}
              </span>
            </div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Controller Action</div>
            <div className="col-span-8">Closure</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Middleware</div>
            <div className="col-span-8">{request.content.middleware}</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Path</div>
            <div className="col-span-8">{request.content.url}</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Status</div>
            <div className="col-span-8">{request.content.status}</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Duration</div>
            <div className="col-span-8">{request.content.duration}ms</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">IP Address</div>
            <div className="col-span-8">{request.content.ipAddress}</div>
          </div>
          <div className="grid items-center grid-cols-12">
            <div className="col-span-4 text-[#5c5f65]">Memory Usage</div>
            <div className="col-span-8">
              {request.content.memoryUsage.rss / 1024 / 1024}MB
            </div>
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  );
}
