"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import dynamic from "next/dynamic";

const QuizPage = dynamic(() => import("../../components/QuizPage"), {
  ssr: false,
});

export default withPageAuthRequired(function Page() {
  return <QuizPage />;
});
