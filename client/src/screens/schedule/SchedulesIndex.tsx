/** @format */

import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";
interface ScheduleResponse {
  uuid: number;
  content: {
    info: string;
    name: string;
    mode: string;
    time: string;
  };
}

export async function loader() {
  const data = await fetch("/api/data/schedules");
  const schedules = await data.json();
  return { schedules };
}

export default function RedisIndex() {
  const { schedules } = useLoaderData() as { schedules: ScheduleResponse[] };

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span>Schedule</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 bg-[#F3F4F6] px-4 py-3 font-medium">
          <span className="col-span-3">Name</span>
          <span className="col-span-3">Recurrence</span>
          <span className="col-span-2">Mode</span>
          <span className="col-span-2">Time</span>
          <span className="col-span-2"></span>
        </div>
        <table className="w-full">
          <tbody>
            {schedules.map((schedule) => (
              <tr
                key={schedule.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4"
              >
                <td className="col-span-3">
                  <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                    {schedule.content.name}
                  </span>
                </td>
                <td className="col-span-3">{schedule.content.info}</td>
                <td className="col-span-2">{schedule.content.mode}</td>
                <td className="col-span-2">{timeAgo(schedule.content.time)}</td>
                <td className="col-span-2 ml-auto">
                  <Link
                    to={`${schedule.uuid}`}
                    state={{ scheduleId: schedule.uuid }}
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
