import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RequestPreview() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Request 1',
      description: 'This is the first request'
    },
    {
      id: 2,
      title: 'Request 2',
      description: 'This is the second request'
    },
    {
      id: 3,
      title: 'Request 3',
      description: 'This is the third request'
    }
  ])

  return (
    <div className="flex flex-col">
      <div className='bg-white px-4 py-3'>
        <span>Requests</span>
      </div>
      <div className='bg-[]'>
        {requests.map(request => (
          <Link to={`${request.id}`}>
            <div key={request.id} className='px-4 py-3'>
              <span>{request.title}</span>
              <span>{request.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
