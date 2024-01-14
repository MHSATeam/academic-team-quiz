"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import dynamic from "next/dynamic";

const MathPage = dynamic(() => import("../../../components/MathPage"), {
  ssr: false,
});

export default withPageAuthRequired(function Page() {
  return <MathPage />;
});
