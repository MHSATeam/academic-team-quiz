import { User } from "@/src/lib/users/types";

export default function formatUserName(user: User | string) {
  let name: string;
  if (typeof user === "object") {
    name = user.name;
  } else {
    name = user;
  }

  const titleCase = name?.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });

  return titleCase;
}
