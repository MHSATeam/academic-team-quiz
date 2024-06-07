import BoxPage from "@/components/pages/buzzer/Box";
// import { prismaClient } from "@/src/utils/clients";

export default async function Page() {
  // const sets = await prismaClient.set.findMany({});
  // console.log(sets.length);
  return <BoxPage sets={[]} />;
}
