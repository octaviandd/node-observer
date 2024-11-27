/** @format */

import React from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

interface MailResponse {
  uuid: number;
  content: {
    to: string;
    from: string;
    html: number;
    text: number;
    time: string;
    subject: string;
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
  const data = await fetch(`/api/data/mails/${params.mailId}`);
  const mail = await data.json();
  return { mail };
}

export default function MailPreview() {
  const { mail } = useLoaderData() as { mail: MailResponse };
  return (
    <div>
      <div className="flex flex-col shadow-md">
        <div className="">
          <div className="bg-white h-full w-full px-4 py-3">
            <span>Mail Details</span>
          </div>
        </div>
        <div className="px-3">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Time</div>
              <div className="col-span-8">
                {new Date(mail.content.time).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                ({timeAgo(mail.content.time)})
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">To</div>
              <div className="col-span-8">{mail.content.to}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">From</div>
              <div className="col-span-8">
                <span className="bg-[#E4E7EB] font-medium px-2 py-1 rounded-md">
                  {mail.content.from}
                </span>
              </div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Text</div>
              <div className="col-span-8">{mail.content.text}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">HTML</div>
              <div className="col-span-8">{mail.content.html}</div>
            </div>
            <div className="grid items-center grid-cols-12">
              <div className="col-span-4 text-[#5c5f65]">Subject</div>
              <div className="col-span-8">{mail.content.subject}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
