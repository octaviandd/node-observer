import React, { useState } from 'react'
import useSWR from 'swr'



const fetcher = (...args: [RequestInfo, RequestInit?]): Promise<{}> => fetch(...args).then(res => res.json())

export default function RequestPreview() {
  const { data, error, isLoading } = useSWR('/api/user/123', fetcher)

  return (
    <div className="flex flex-col shadow-md">
      <div className=''>
        <div className='bg-white h-full w-full px-4 py-3'>
          <span>Request Details</span>
        </div>
      </div>
      <div className='px-3'>
        {/* {isLoading && <div>Loading...</div>}
        {error && <div>Error loading data</div>}
        {data && ( */}
        <div className='flex flex-col gap-y-4 py-4'>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Time</div>
            <div className='col-span-8'>12312</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Hostname</div>
            <div className='col-span-8'>test.home</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Method</div>
            <div className='col-span-8'>
              <span className='bg-neutral-300 px-3 py-1'>
                GET
              </span>
            </div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Controller Action</div>
            <div className='col-span-8'>Closure</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Middlware</div>
            <div className='col-span-8'>web</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Path</div>
            <div className='col-span-8'>/</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Status</div>
            <div className='col-span-8'>200</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Duration</div>
            <div className='col-span-8'>50ms</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>IP Address</div>
            <div className='col-span-8'>127.0.0.1</div>
          </div>
          <div className='grid items-center grid-cols-12'>
            <div className='col-span-4 text-[#5c5f65]'>Memory Usage</div>
            <div className='col-span-8'>2MB</div>
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  )
}
