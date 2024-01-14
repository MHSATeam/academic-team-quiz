"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import dynamic from "next/dynamic";

const BuzzerPage = dynamic(() => import("../../../components/BuzzerPage"), {
  ssr: false,
});

export default withPageAuthRequired(function Page() {
  return <BuzzerPage />;
});
