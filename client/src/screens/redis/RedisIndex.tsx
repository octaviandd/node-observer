/** @format */

import React from "react";
import { Link, useLoaderData } from "react-router-dom";

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
    return `${seconds} second${seconds == 1 ? "" : "s"} ago`;
  }
};

export async function loader() {
  const data = await fetch("/api/data/redis");
  const redis = await data.json();
  return { redis };
}

export default function RedisIndex() {
  const { redis } = useLoaderData() as { redis: RedisResponse[] };
  console.log(redis);

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span>Redis</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] px-4 py-3 font-medium">
          <span className="col-span-2">Key</span>
          <span className="col-span-2">Value</span>
          <span className="col-span-2">Time</span>
          <span className="col-span-1">Type</span>
          <span className="col-span-1">DB</span>
          <span className="col-span-1">Port</span>
          <span className="col-span-1"></span>
        </div>
        <table className="w-full">
          <tbody>
            {redis.map((redisRow) => (
              <tr
                key={redisRow.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4"
              >
                <td className="col-span-2">
                  <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                    {redisRow.content.key}
                  </span>
                </td>
                <td className="col-span-2">{redisRow.content.value}</td>
                <td className="col-span-2">{timeAgo(redisRow.content.time)}</td>
                <td className="col-span-1">{redisRow.content.type}</td>
                <td className="col-span-1">{redisRow.content.db}</td>
                <td className="col-span-1">{redisRow.content.port}</td>
                <td className="col-span-1 ml-auto">
                  <Link
                    to={`${redisRow.uuid}`}
                    state={{ redisRowId: redisRow.uuid }}
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
