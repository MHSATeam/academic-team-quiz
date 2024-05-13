import { ReactNode } from "react";

export default function StaticLayout({ children }: { children: ReactNode }) {
  return <main className="h-full px-6 py-12">{children}</main>;
}
