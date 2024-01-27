import QuizPage from "@/components/pages/QuizPage";
import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  const categories = await prismaClient.category.findMany();
  return <QuizPage categories={categories} />;
}
