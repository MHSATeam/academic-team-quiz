"use client";

import dynamic from "next/dynamic";

const MathPage = dynamic(
  () => import("../../../../components/pages/study/ComputationalMath"),
  {
    ssr: false,
  },
);

export default function Page() {
  return <MathPage />;
}
