import { getSession } from "@auth0/nextjs-auth0";
import { BookMarked, Home, LogIn, LogOut, Siren } from "lucide-react";
import Link from "next/link";

export async function BottomNav() {
  const session = await getSession();
  const isLoggedOut = !session;
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full max-sm:h-20 h-16 max-sm:pb-4 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {[
          { to: "/", name: "Home", icon: Home },
          { to: "/study", name: "Study", icon: BookMarked },
          { to: "/buzzer", name: "Buzzer", icon: Siren },
          {
            to: `/api/auth/${isLoggedOut ? "login" : "logout"}`,
            name: isLoggedOut ? "Login" : "Logout",
            icon: isLoggedOut ? LogIn : LogOut,
          },
        ].map(({ to, name, icon: Icon }, index) => (
          <Link
            href={to}
            key={index}
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"
          >
            <Icon />
            <span className="text-sm">{name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
