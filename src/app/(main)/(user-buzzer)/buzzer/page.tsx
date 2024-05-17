"use client";

import dynamic from "next/dynamic";

const Buzzer = dynamic(
  () => import("../../../../components/pages/buzzer/Buzzer"),
  {
    ssr: false,
  },
);

export default function Page() {
  return <Buzzer />;
}
