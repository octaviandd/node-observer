/** @format */

import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { LoaderFunctionArgs } from "react-router-dom";
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

export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetch(`/api/data/exceptions/${params.exceptionId}`);
  const exception = await data.json();
  return { exception };
}

export default function ExceptionPreview() {
  const { exception } = useLoaderData() as { exception: ExceptionResponse };

  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>Exception Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(exception.content.time).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(exception.content.time)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Name</div>
              <div className="col-span-8">{exception.content.name}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Message</div>
              <div className="col-span-8">
                <span className="font-medium py-1 rounded-md">
                  {exception.content.message}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Stack</div>
              <div className="col-span-8">{exception.content.stack}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
