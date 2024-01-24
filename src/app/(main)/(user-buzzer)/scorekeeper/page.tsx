"use client";

import dynamic from "next/dynamic";

const Scorekeeper = dynamic(
  () => import("../../../../components/pages/Scorekeeper"),
  {
    ssr: false,
  }
);
export default function Page() {
  return <Scorekeeper />;
}
