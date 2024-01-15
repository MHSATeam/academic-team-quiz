"use client";

import dynamic from "next/dynamic";

const BuzzerBox = dynamic(() => import("../../../components/BuzzerBox"), {
  ssr: false,
});
export default function Page() {
  return <BuzzerBox />;
}
