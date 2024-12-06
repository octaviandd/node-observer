/** @format */

import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { timeAgo } from "../../utils";

interface ExceptionResponse {
  uuid: number;
  content: {
    message: string;
    stack: string;
    name: number;
    time: string;
  };
}

export async function loader() {
  const data = await fetch("/api/data/exceptions");
  const exceptions = await data.json();
  return { exceptions };
}

export default function ExceptionsIndex() {
  const { exceptions } = useLoaderData() as { exceptions: ExceptionResponse[] };

  console.log(exceptions);

  return (
    <div className="flex flex-col">
      <div className="bg-white px-4 py-3">
        <span className="font-medium">Exceptions</span>
      </div>
      <div className="bg-[]">
        <div className="w-full grid grid-cols-12 gap-1 bg-[#F3F4F6] px-4 py-3 font-semibold text-sm">
          <span className="col-span-1">Name</span>
          <span className="col-span-3">Message</span>
          <span className="col-span-6">Stack</span>
          <span className="col-span-1">Time</span>
          <span className="col-span-1"></span>
        </div>
        <table className="w-full">
          <tbody>
            {exceptions.map((exception) => (
              <tr
                key={exception.uuid}
                className="grid w-full grid-cols-12 py-3 bg-white px-4 text-sm gap-1 border-t border-neutral-200"
              >
                <td className="col-span-1">
                  <span className="font-medium rounded-md text-sm">
                    {exception.content.name}
                  </span>
                </td>
                <td className="col-span-3 text-ellipsis overflow-hidden">
                  <span className="">{exception.content.message}</span>
                </td>
                <td className="col-span-6 text-ellipsis overflow-hidden">
                  <span>{exception.content.stack}</span>
                </td>
                <td className="col-span-1">
                  {timeAgo(exception.content.time)}
                </td>
                <td className="col-span-1 ml-auto">
                  <Link
                    to={`${exception.uuid}`}
                    state={{ exceptionId: exception.uuid }}
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
