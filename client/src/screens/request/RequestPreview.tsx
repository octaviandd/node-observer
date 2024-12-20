/** @format */

import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { LoaderFunctionArgs } from "react-router-dom";
import { timeAgo } from "../../utils";

interface RequestResponse {
  uuid: number;
  content: {
    method: string;
    url: string;
    duration: number;
    status: number;
    timestamp: string;
    hostname: string;
    session: {
      [key: string]: string;
    };
    middleware: string;
    headers: {
      [key: string]: string;
    };
    response: {
      [key: string]: string;
    };
    ipAddress: string;
    payload: object;
    memoryUsage: {
      heapTotal: number;
      rss: number;
    };
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/requests/${params.requestId}`);
  const request = await data.json();
  console.log(request);
  return { request };
}

export default function RequestPreview() {
  const { request } = useLoaderData() as { request: RequestResponse };
  const [tabs, setTabs] = useState([
    {
      id: 0,
      title: "Payload",
      active: true,
    },
    {
      id: 1,
      title: "Headers",
      active: false,
    },
    {
      id: 2,
      title: "Session",
      active: false,
    },
    {
      id: 3,
      title: "Response",
      active: false,
    },
  ]);

  useEffect(() => {
    fetch(`/api/data/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Hello from the client",
      }),
    });
  }, []);

  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span className="font-medium">Request Details</span>
          </div>
        </div>
        <div className="px-3">
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
                <span className="bg-[#E4E7EB] font-medium px-2  rounded-md">
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
              <div className="col-span-8">
                <span
                  className={`${
                    String(request.content.status).startsWith("2")
                      ? "bg-[#D1FAE4]"
                      : String(request.content.status).startsWith("3")
                      ? "bg-[#D1FAE4]"
                      : "bg-red-300"
                  } px-2 py-1 rounded-md`}
                >
                  {request.content.status}
                </span>
              </div>
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
                {(request.content.memoryUsage.rss / 1024 / 1024).toFixed(0)}MB
              </div>
            </div>
          </div>
          {/* )} */}
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
                  {Object.entries(request.content.payload).length > 0 ? (
                    Object.entries(request.content.payload).map(
                      ([key, value]) => (
                        <div key={key} className="flex hover:bg-neutral-600">
                          <span>{key}: </span>
                          <span className="text-blue-500 break-all whitespace-pre-wrap">
                            {value}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="flex hover:bg-neutral-600">
                      <span>{"{"} </span>
                      <span className="">{"}"}</span>
                    </div>
                  )}
                </pre>
              </div>
            )}
            {tabs[1].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(request.content.headers).map(
                    ([key, value]) => (
                      <div key={key} className="flex hover:bg-neutral-600">
                        <span>{key}: </span>
                        <span className="text-blue-500 break-all whitespace-pre-wrap">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </pre>
              </div>
            )}
            {tabs[2].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(request.content.session).length > 0 ? (
                    Object.entries(request.content.session).map(
                      ([key, value]) => (
                        <div key={key} className="flex hover:bg-neutral-600">
                          <span>{key}: </span>
                          <span className="text-blue-500 break-all whitespace-pre-wrap">
                            {value}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="flex hover:bg-neutral-600">
                      <span>{"{"} </span>
                      <span>{"}"}</span>
                    </div>
                  )}
                </pre>
              </div>
            )}
            {tabs[3].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(request.content.response[0]).length > 0 ? (
                    Object.entries(request.content.response[0]).map(
                      ([key, value]) => (
                        <div key={key} className="flex hover:bg-neutral-600">
                          <span>{key}: </span>
                          <span className="text-blue-500 break-all whitespace-pre-wrap">
                            {value}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="flex hover:bg-neutral-600">
                      <span>{"{"} </span>
                      <span>{"}"}</span>
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
