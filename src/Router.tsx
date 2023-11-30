import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import App from "./App";
import { RealtimeStatus } from "./buzzers/ably-realtime";
import { lazy, Suspense } from "react";
import Error404 from "./components/404";
const QuizPage = lazy(() => import("./components/QuizPage"));
const Login = lazy(() => import("./components/Login"));
const MathPage = lazy(() => import("./components/MathPage"));
const BuzzerPage = lazy(() => import("./components/BuzzerPage"));
const BuzzerBox = lazy(() => import("./components/BuzzerBox"));
const SetPage = lazy(() => import("./components/SetPage"));

const loadRealtime = async () => {
  RealtimeStatus.connect();
  return checkAuth();
};

const checkAuth = async () => {
  const heartbeat = await (await fetch("/api/heartbeat")).json();
  if (!heartbeat.alive) {
    return redirect("/login");
  }
  return null;
};
const loadingFallback = <span>Loading...</span>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: checkAuth,
    errorElement: <Error404 />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={loadingFallback}>
            <QuizPage />
          </Suspense>
        ),
      },
      {
        path: "set",
        element: (
          <Suspense fallback={loadingFallback}>
            <SetPage />
          </Suspense>
        ),
      },
      {
        path: "math",
        element: (
          <Suspense fallback={loadingFallback}>
            <MathPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={loadingFallback}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/buzzer",
    element: (
      <Suspense fallback={loadingFallback}>
        <BuzzerPage />
      </Suspense>
    ),
    loader: loadRealtime,
  },
  {
    path: "/buzzer-box",
    element: (
      <Suspense fallback={loadingFallback}>
        <BuzzerBox />
      </Suspense>
    ),
    loader: loadRealtime,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
