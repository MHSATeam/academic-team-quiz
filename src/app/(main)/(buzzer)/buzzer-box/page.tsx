import BoxPage from "@/components/pages/buzzer/Box";
import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  const sets = await prismaClient.set.findManyCompleteSets();
  return <BoxPage sets={sets} />;
}
