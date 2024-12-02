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
import ExceptionIndex, {
  loader as ExceptionIndexLoader,
} from "./screens/exception/ExceptionsIndex";
import ExceptionPreview, {
  loader as ExceptionPreviewLoader,
} from "./screens/exception/ExceptionPreview";
import DumpsIndex from "./screens/dump/DumpsIndex";
import NotificationsIndex, {
  loader as NotificationsIndexLoader,
} from "./screens/notification/NotificationsIndex";
import NotificationPreview, {
  loader as NotificationsViewLoader,
} from "./screens/notification/NotificationPreview";
import JobIndex from "./screens/job/JobsIndex";
import JobPreview from "./screens/job/JobPreview";
import BatchesIndex from "./screens/batch/BatchesIndex";
import BatchPreview from "./screens/batch/BatchPreview";
import EventsIndex from "./screens/event/EventsIndex";
import EventPreview from "./screens/event/EventPreview";
import CacheIndex, {
  loader as CacheIndexLoader,
} from "./screens/cache/CachesIndex";
import CachePreview, {
  loader as CachePreviewLoader,
} from "./screens/cache/CachePreview";
import QueriesIndex, {
  loader as QueriesIndexLoader,
} from "./screens/query/QueriesIndex";
import QueryPreview, {
  loader as QueryPreviewLoader,
} from "./screens/query/QueryPreview";
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
import HttpIndex, {
  loader as httpIndexLoader,
} from "./screens/http/HttpsIndex";
import HttpPreview, {
  loader as httpViewLoader,
} from "./screens/http/HttpPreview";
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
        path: "/exceptions/:exceptionId",
        element: <ExceptionPreview />,
        loader: ExceptionPreviewLoader,
      },
      {
        path: "/exceptions",
        element: <ExceptionIndex />,
        loader: ExceptionIndexLoader,
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
        path: "/notifications/:notificationId",
        element: <NotificationPreview />,
        loader: NotificationsViewLoader,
      },
      {
        path: "/notifications",
        element: <NotificationsIndex />,
        loader: NotificationsIndexLoader,
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
        path: "/cache/:cacheId",
        element: <CachePreview />,
        loader: CachePreviewLoader,
      },
      {
        path: "/cache",
        element: <CacheIndex />,
        loader: CacheIndexLoader,
      },
      {
        path: "/queries/:queryId",
        element: <QueryPreview />,
        loader: QueryPreviewLoader,
      },
      {
        path: "/queries",
        element: <QueriesIndex />,
        loader: QueriesIndexLoader,
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
      {
        path: "/http",
        element: <HttpIndex />,
        loader: httpIndexLoader,
      },
      {
        path: "/http/:httpId",
        element: <HttpPreview />,
        loader: httpViewLoader,
      },
      // {
      //   path: '/monitored-tags',
      //   element: <MonitoredTags />,
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
