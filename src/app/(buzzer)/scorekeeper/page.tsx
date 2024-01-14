"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import dynamic from "next/dynamic";

const Scorekeeper = dynamic(() => import("../../../components/Scorekeeper"), {
  ssr: false,
});
export default withPageAuthRequired(function Page() {
  return <Scorekeeper />;
});
