import { Link, NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <header className="no-print">
        <h1>Academic Team Quiz</h1>
        <div className="links">
          <NavLink
            to="/"
            className={({ isActive }) => "link" + (isActive ? " active" : "")}
          >
            Quiz Yourself!
          </NavLink>
          <NavLink
            to="/set"
            className={({ isActive }) => "link" + (isActive ? " active" : "")}
          >
            Create A Set!
          </NavLink>
          <NavLink
            to="/math"
            className={({ isActive }) => "link" + (isActive ? " active" : "")}
          >
            Practice Math!
          </NavLink>
        </div>
      </header>
      <Outlet />
    </>
  );
}
