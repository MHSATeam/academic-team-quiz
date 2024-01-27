import { BottomNav } from "@/components/layout/BottomNav";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mb-16 max-sm:mb-20 grow relative overflow-auto">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
