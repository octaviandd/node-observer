/** @format */

import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface RequestResponse {
  uuid: number;
  content: {
    method: string;
    url: string;
    duration: number;
    status: number;
    timestamp: string;
  };
}

export async function loader() {
  const data = await fetch("/api/data/requests");
  const requests = await data.json();
  return { requests };
}

export default function RequestsIndex() {
  const { requests } = useLoaderData() as { requests: RequestResponse[] };

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span>Requests</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] px-4 py-3 font-medium">
          <span className="col-span-1">Verb</span>
          <span className="col-span-4">Path</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Duration</span>
          <span className="col-span-2">Happened</span>
          <span className="col-span-1"></span>
        </div>
        <table className="w-full">
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4"
              >
                <td className="col-span-1">
                  <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                    {request.content.method}
                  </span>
                </td>
                <td className="col-span-4">{request.content.url}</td>
                <td className="col-span-2">
                  <span
                    className={`${
                      request.content.status === 200
                        ? "bg-[#D1FAE4]"
                        : request.content.status === 404
                        ? "bg-[#D1FAE4]"
                        : "bg-red-300"
                    } px-2 py-1 rounded-md`}
                  >
                    {request.content.status}
                  </span>
                </td>
                <td className="col-span-2">{request.content.duration}ms</td>
                <td className="col-span-1">
                  {timeAgo(request.content.timestamp)}
                </td>
                <td className="col-span-1 ml-auto">
                  <Link
                    to={`${request.uuid}`}
                    state={{ requestId: request.uuid }}
                  >
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
