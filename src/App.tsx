import classNames from "classnames";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="p-8 md:mx-32 mx-auto">
      <header className="no-print border-b-4 border-black justify-between flex pb-2 mb-2">
        <h1 className="text-xl">Academic Team Quiz</h1>
        <div className="flex items-center gap-4 shrink">
          {[
            { to: "/", name: "Quiz" },
            { to: "/set", name: "Set" },
            { to: "/math", name: "Math" },
            { to: "/buzzer", name: "Buzzer" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames("hover:underline", {
                  underline: isActive,
                })
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
