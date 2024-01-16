"use client";

import dynamic from "next/dynamic";

const BuzzerPage = dynamic(
  () => import("../../../components/pages/BuzzerPage"),
  {
    ssr: false,
  }
);

export default function Page() {
  return <BuzzerPage />;
}
