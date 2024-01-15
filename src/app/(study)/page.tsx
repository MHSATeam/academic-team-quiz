"use client";

import dynamic from "next/dynamic";

const QuizPage = dynamic(() => import("../../components/QuizPage"), {
  ssr: false,
});

export default function Page() {
  return <QuizPage />;
}
