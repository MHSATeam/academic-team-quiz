import { ReactNode } from "react";

export default function StaticLayout({ children }: { children: ReactNode }) {
  return <main className="py-12 px-6">{children}</main>;
}
