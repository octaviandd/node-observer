import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MailIndex from './screens/mail/MailsIndex';
import MailPreview from './screens/mail/MailPreview';
import ExceptionIndex from './screens/exception/ExceptionsIndex';
import ExceptionPreview from './screens/exception/ExceptionPreview';
import DumpsIndex from './screens/dump/DumpsIndex';
import NotificationsIndex from './screens/notification/NotificationsIndex';
import NotificationPreview from './screens/notification/NotificationPreview';
import JobIndex from './screens/job/JobsIndex';
import JobPreview from './screens/job/JobPreview';
import BatchesIndex from './screens/batch/BatchesIndex';
import BatchPreview from './screens/batch/BatchPreview';
import EventsIndex from './screens/event/EventsIndex';
import EventPreview from './screens/event/EventPreview';
import CacheIndex from './screens/cache/CachesIndex';
import CachePreview from './screens/cache/CachePreview';
import QueriesIndex from './screens/query/QueriesIndex';
import QueryPreview from './screens/query/QueryPreview';
import ModelsIndex from './screens/model/ModelsIndex';
import ModelPreview from './screens/model/ModelPreview';
import RequestsIndex from './screens/request/RequestsIndex';
import RequestPreview from './screens/request/RequestPreview';
import CommandsIndex from './screens/command/CommandsIndex';
import CommandPreview from './screens/command/CommandPreview';
import ScheduleIndex from './screens/schedule/SchedulesIndex';
import SchedulePreview from './screens/schedule/SchedulePreview';
import RedisIndex from './screens/redis/RedisIndex';
import RedisPreview from './screens/redis/RedisPreview';
import LogIndex from './screens/log/LogsIndex';
import LogPreview from './screens/log/LogPreview';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div>404</div>,
    children: [
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
        element: <LogIndex />,
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
        element: <JobIndex />,
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
      // {
      //   path: '/monitored-tags',
      //   element: <MonitoredTags />,
      // },
      // {
      //   path: '/gates/:id',
      //   element: <GatePreview />,
      // },
      // {
      //   path: '/gates',
      //   element: <GatesIndex />,
      // },
      // {
      //   path: '/views/:id',
      //   element: <ViewPreview />,
      // },
      // {
      //   path: '/views',
      //   element: <ViewsIndex />,
      // },
      // {
      //   path: '/client-requests/:id',
      //   element: <ClientRequestPreview />,
      // },
      // {
      //   path: '/client-requests',
      //   element: <ClientRequestsIndex />,
      // },
    ]
  },
]);

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)