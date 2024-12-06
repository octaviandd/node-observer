/** @format */

import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface JobResponse {
  uuid: number;
  content: {
    channel: string;
    name: string;
    data: string;
    time: string;
  };
}

export async function loader() {
  const data = await fetch("/api/data/jobs");
  const jobs = await data.json();
  return { jobs };
}

export default function JobsIndex() {
  const { jobs } = useLoaderData() as {
    jobs: JobResponse[];
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span>Jobs</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] gap-1 px-4 py-3 font-semibold text-sm">
          <span className="col-span-3">Channel</span>
          <span className="col-span-3">Name</span>
          <span className="col-span-2">Value</span>
          <span className="col-span-2">Time</span>
          <span className="col-span-2"></span>
        </div>
        <table className="w-full">
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4 gap-1 border-t border-neutral-200"
              >
                <td className="col-span-3">
                  <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                    {job.content.channel}
                  </span>
                </td>
                <td className="col-span-3">{job.content.name}</td>
                <td className="col-span-2">
                  {JSON.stringify(job.content.data)}
                </td>
                <td className="col-span-2">{timeAgo(job.content.time)}</td>
                <td className="col-span-2 ml-auto">
                  <Link to={`${job.uuid}`} state={{ jobId: job.uuid }}>
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
