/** @format */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MailsIndex, {
  loader as MailIndexLoader,
} from "./screens/mail/MailsIndex";
import MailPreview, {
  loader as MailViewLoader,
} from "./screens/mail/MailPreview";
import ExceptionIndex from "./screens/exception/ExceptionsIndex";
import ExceptionPreview from "./screens/exception/ExceptionPreview";
import DumpsIndex from "./screens/dump/DumpsIndex";
import NotificationsIndex from "./screens/notification/NotificationsIndex";
import NotificationPreview from "./screens/notification/NotificationPreview";
import JobIndex from "./screens/job/JobsIndex";
import JobPreview from "./screens/job/JobPreview";
import BatchesIndex from "./screens/batch/BatchesIndex";
import BatchPreview from "./screens/batch/BatchPreview";
import EventsIndex from "./screens/event/EventsIndex";
import EventPreview from "./screens/event/EventPreview";
import CacheIndex from "./screens/cache/CachesIndex";
import CachePreview from "./screens/cache/CachePreview";
import QueriesIndex from "./screens/query/QueriesIndex";
import QueryPreview from "./screens/query/QueryPreview";
import ModelsIndex from "./screens/model/ModelsIndex";
import ModelPreview from "./screens/model/ModelPreview";
import RequestsIndex, {
  loader as RequestIndexLoader,
} from "./screens/request/RequestsIndex";
import RequestPreview, {
  loader as RequestPreviewLoader,
} from "./screens/request/RequestPreview";
import CommandsIndex from "./screens/command/CommandsIndex";
import CommandPreview from "./screens/command/CommandPreview";
import ScheduleIndex, {
  loader as ScheduleIndexLoader,
} from "./screens/schedule/SchedulesIndex";
import SchedulePreview, {
  loader as ScheduleViewLoader,
} from "./screens/schedule/SchedulePreview";
import RedisIndex, {
  loader as RedisIndexLoader,
} from "./screens/redis/RedisIndex";
import RedisPreview, {
  loader as RedisViewLoader,
} from "./screens/redis/RedisPreview";
import LogIndex from "./screens/log/LogsIndex";
import LogPreview from "./screens/log/LogPreview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>404</div>,
    children: [
      {
        path: "/mails/:mailId",
        element: <MailPreview />,
        loader: MailViewLoader,
      },
      {
        path: "/mails",
        element: <MailsIndex />,
        loader: MailIndexLoader,
      },
      {
        path: "/exceptions/:id",
        element: <ExceptionPreview />,
      },
      {
        path: "/exceptions",
        element: <ExceptionIndex />,
      },
      {
        path: "/dumps",
        element: <DumpsIndex />,
      },
      {
        path: "/logs/:id",
        element: <LogPreview />,
      },
      {
        path: "/logs",
        element: <LogIndex />,
      },
      {
        path: "/notifications/:id",
        element: <NotificationPreview />,
      },
      {
        path: "/notifications",
        element: <NotificationsIndex />,
      },
      {
        path: "/jobs/:id",
        element: <JobPreview />,
      },
      {
        path: "/jobs",
        element: <JobIndex />,
      },
      {
        path: "/batches/:id",
        element: <BatchPreview />,
      },
      {
        path: "/batches",
        element: <BatchesIndex />,
      },
      {
        path: "/events/:id",
        element: <EventPreview />,
      },
      {
        path: "/events",
        element: <EventsIndex />,
      },
      {
        path: "/cache/:id",
        element: <CachePreview />,
      },
      {
        path: "/cache",
        element: <CacheIndex />,
      },
      {
        path: "/queries/:id",
        element: <QueryPreview />,
      },
      {
        path: "/queries",
        element: <QueriesIndex />,
      },
      {
        path: "/models/:id",
        element: <ModelPreview />,
      },
      {
        path: "/models",
        element: <ModelsIndex />,
      },
      {
        path: "/requests/:requestId",
        element: <RequestPreview />,
        loader: RequestPreviewLoader,
      },
      {
        path: "/requests",
        element: <RequestsIndex />,
        loader: RequestIndexLoader,
      },
      {
        path: "/commands/:id",
        element: <CommandPreview />,
      },
      {
        path: "/commands",
        element: <CommandsIndex />,
      },
      {
        path: "/schedules/:scheduleId",
        element: <SchedulePreview />,
        loader: ScheduleViewLoader,
      },
      {
        path: "/schedules",
        element: <ScheduleIndex />,
        loader: ScheduleIndexLoader,
      },
      {
        path: "/redis/:redisRowId",
        element: <RedisPreview />,
        loader: RedisViewLoader,
      },
      {
        path: "/redis",
        element: <RedisIndex />,
        loader: RedisIndexLoader,
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
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
