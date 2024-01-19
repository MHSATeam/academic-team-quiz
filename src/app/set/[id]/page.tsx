import { prismaClient } from "@/src/utils/clients";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return null;
  }

  const set = await prismaClient.set.findFirst({
    where: {
      id: numberId,
    },
  });

  if (set === null) {
    return null;
  }

  return (
    <main className="py-12 px-6 flex flex-col">
      <span className="dark:text-white text-2xl">Set: {set.name}</span>
      <span className="dark:text-white">
        This page has not been implemented yet!
      </span>
    </main>
  );
}
