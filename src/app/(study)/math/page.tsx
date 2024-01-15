"use client";

import dynamic from "next/dynamic";

const MathPage = dynamic(() => import("../../../components/MathPage"), {
  ssr: false,
});

export default function Page() {
  return <MathPage />;
}
