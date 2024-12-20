/** @format */

import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { LoaderFunctionArgs } from "react-router-dom";
import { timeAgo } from "../../utils";
interface HttpResponse {
  uuid: number;
  content: {
    url: string;
    method: string;
    status: number;
    session: number;
    response: string;
    timestamp: string;
    duration: number;
    headers: object;
    rawHeaders: object;
    version: number;
    options: object;
    protocol: string;
    hostname: string;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/http/${params.httpId}`);
  const http = await data.json();
  return { http };
}

export default function HttpPreview() {
  const { http } = useLoaderData() as { http: HttpResponse };
  const [tabs, setTabs] = useState([
    {
      id: 0,
      title: "Options",
      active: true,
    },
    {
      id: 1,
      title: "Raw Headers",
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
    {
      id: 4,
      title: "Memory Usage",
      active: false,
    },
  ]);

  console.log(http);

  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>HTTP Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(http.content.timestamp).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(http.content.timestamp)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Hostname</div>
              <div className="col-span-8">{http.content.hostname}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Method</div>
              <div className="col-span-8">
                <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                  {http.content.method}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Controller Action</div>
              <div className="col-span-8">Closure</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Version</div>
              <div className="col-span-8">{http.content.version}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Path</div>
              <div className="col-span-8">{http.content.url}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Status</div>
              <div className="col-span-8">
                <span
                  className={`${
                    http.content.status === 200
                      ? "bg-[#D1FAE4]"
                      : http.content.status === 404
                      ? "bg-[#D1FAE4]"
                      : "bg-red-300"
                  } px-2 py-1 rounded-md`}
                >
                  {http.content.status}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Duration</div>
              <div className="col-span-8">{http.content.duration}ms</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Hostname</div>
              <div className="col-span-8">{http.content.hostname}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Memory Usage</div>
              <div className="col-span-8">
                {(http.content.memoryUsage.rss / 1024 / 1024).toFixed(0)}MB
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
                  {Object.entries(http.content.options).length > 0 ? (
                    Object.entries(http.content.options).map(([key, value]) => (
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
            {tabs[1].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(http.content.rawHeaders).length > 0 ? (
                    Object.entries(http.content.rawHeaders).map(
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
            {tabs[2].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(http.content.session).length > 0 ? (
                    Object.entries(http.content.session).map(([key, value]) => (
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
                      <span>{"}"}</span>
                    </div>
                  )}
                </pre>
              </div>
            )}
            {tabs[3].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(http.content.response).length > 0 ? (
                    Object.entries(http.content.response).map(
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
            {tabs[4].active && (
              <div className="break-words">
                <pre className="pl-6 pr-12">
                  {Object.entries(http.content.memoryUsage).length > 0 ? (
                    Object.entries(http.content.memoryUsage).map(
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
