"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import dynamic from "next/dynamic";

const BuzzerBox = dynamic(() => import("../../../components/BuzzerBox"), {
  ssr: false,
});
export default withPageAuthRequired(function Page() {
  return <BuzzerBox />;
});
