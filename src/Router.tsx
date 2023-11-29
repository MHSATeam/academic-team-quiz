import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import QuizPage from "./components/QuizPage";
import Login from "./components/Login";
import App from "./App";
import Error404 from "./components/404";
import SetPage from "./components/SetPage";
import MathPage from "./components/MathPage";
import BuzzerPage from "./components/BuzzerPage";
import { RealtimeStatus } from "./buzzers/ably-realtime";
import BuzzerBox from "./components/BuzzerBox";

const loadRealtime = () => {
  RealtimeStatus.connect();
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: async () => {
      const heartbeat = await (await fetch("/api/heartbeat")).json();
      if (!heartbeat.alive) {
        return redirect("/login");
      }
      return null;
    },
    errorElement: <Error404 />,
    children: [
      { path: "", element: <QuizPage /> },
      { path: "set", element: <SetPage /> },
      { path: "math", element: <MathPage /> },
      {
        path: "buzzer",
        element: <BuzzerPage />,
        loader: loadRealtime,
      },
      {
        path: "buzzer-box",
        element: <BuzzerBox />,
        loader: loadRealtime,
      },
    ],
  },
  { path: "/login", element: <Login /> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
