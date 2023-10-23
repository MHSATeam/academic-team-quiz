import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: "xx-large",
        }}
      >
        404 Page Not Found
      </span>
      <Link to="/">Go Home</Link>
    </div>
  );
}
