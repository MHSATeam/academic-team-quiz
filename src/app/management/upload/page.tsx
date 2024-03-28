import UploadSet from "@/components/pages/UploadSet";
import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  const categories = await prismaClient.category.findMany();
  return <UploadSet categories={categories} />;
}
