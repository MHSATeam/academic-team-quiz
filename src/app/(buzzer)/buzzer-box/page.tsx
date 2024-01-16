"use client";

import dynamic from "next/dynamic";

const BuzzerBox = dynamic(() => import("../../../components/pages/BuzzerBox"), {
  ssr: false,
});
export default function Page() {
  return <BuzzerBox />;
}
