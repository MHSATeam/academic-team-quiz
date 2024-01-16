"use client";

import dynamic from "next/dynamic";

const QuizPage = dynamic(() => import("../../components/pages/QuizPage"), {
  ssr: false,
});

export default function Page() {
  return <QuizPage />;
}
