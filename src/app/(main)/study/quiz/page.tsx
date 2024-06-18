import QuickQuiz from "@/components/pages/study/QuickQuiz";
import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  const categories = await prismaClient.category.findMany();
  return <QuickQuiz categories={categories} />;
}
