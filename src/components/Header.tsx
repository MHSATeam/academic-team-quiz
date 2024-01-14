"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { user, error, isLoading } = useUser();

  const displaySignIn = user === undefined || isLoading;

  if (error) return <div>{error.message}</div>;

  return (
    <header className="no-print border-b-4 border-black justify-between flex pb-2 mb-2">
      <h1 className="text-xl">Academic Team Quiz</h1>
      <div className="flex items-center gap-4 shrink">
        {[
          { to: "/", name: "Quiz" },
          { to: "/math", name: "Math" },
          { to: "/buzzer", name: "Buzzer" },
        ].map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={classNames("hover:underline", {
              underline: item.to === pathname,
            })}
          >
            {item.name}
          </Link>
        ))}
        <a href={displaySignIn ? "/api/auth/login" : "/api/auth/logout"}>
          {displaySignIn ? "Login" : "Logout"}
        </a>
      </div>
    </header>
  );
}
