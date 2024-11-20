import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <Navigate to="/requests" /> 
  },

  {
    path: '/mail/:id',
    element: <MailPreview />,
  },

  {
    path: '/mail',
    element: <MailIndex />,
  },

  {
    path: '/exceptions/:id',
    element: <ExceptionPreview />,
  },

  {
    path: '/exceptions',
    element: <ExceptionIndex />,
  },

  {
    path: '/dumps',
    element: <DumpsIndex />,
  },

  {
    path: '/logs/:id',
    element: <LogPreview />,
  },

  {
    path: '/logs',
    element: <LogsIndex />,
  },

  {
    path: '/notifications/:id',
    element: <NotificationPreview />,
  },

  {
    path: '/notifications',
    element: <NotificationsIndex />,
  },

  {
    path: '/jobs/:id',
    element: <JobPreview />,
  },

  {
    path: '/jobs',
    element: <JobsIndex />,
  },

  {
    path: '/batches/:id',
    element: <BatchPreview />,
  },

  {
    path: '/batches',
    element: <BatchesIndex />,
  },

  {
    path: '/events/:id',
    element: <EventPreview />,
  },

  {
    path: '/events',
    element: <EventsIndex />,
  },

  {
    path: '/cache/:id',
    element: <CachePreview />,
  },

  {
    path: '/cache',
    element: <CacheIndex />,
  },

  {
    path: '/queries/:id',
    element: <QueryPreview />,
  },

  {
    path: '/queries',
    element: <QueriesIndex />,
  },

  {
    path: '/models/:id',
    element: <ModelPreview />,
  },

  {
    path: '/models',
    element: <ModelsIndex />,
  },

  {
    path: '/requests/:id',
    element: <RequestPreview />,
  },

  {
    path: '/requests',
    element: <RequestsIndex />,
  },

  {
    path: '/commands/:id',
    element: <CommandPreview />,
  },

  {
    path: '/commands',
    element: <CommandsIndex />,
  },

  {
    path: '/schedule/:id',
    element: <SchedulePreview />,
  },

  {
    path: '/schedule',
    element: <ScheduleIndex />,
  },

  {
    path: '/redis/:id',
    element: <RedisPreview />,
  },

  {
    path: '/redis',
    element: <RedisIndex />,
  },

  {
    path: '/monitored-tags',
    element: <MonitoredTags />,
  },

  {
    path: '/gates/:id',
    element: <GatePreview />,
  },

  {
    path: '/gates',
    element: <GatesIndex />,
  },

  {
    path: '/views/:id',
    element: <ViewPreview />,
  },

  {
    path: '/views',
    element: <ViewsIndex />,
  },

  {
    path: '/client-requests/:id',
    element: <ClientRequestPreview />,
  },

  {
    path: '/client-requests',
    element: <ClientRequestsIndex />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}><App /></RouterProvider>
  </StrictMode>,
)


