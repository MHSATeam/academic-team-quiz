import UploadSet from "@/components/pages/management/UploadSet";
import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  const categories = await prismaClient.category.findMany();
  return <UploadSet categories={categories} />;
}
