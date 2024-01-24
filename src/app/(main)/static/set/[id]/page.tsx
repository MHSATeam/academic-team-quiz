import { prismaClient } from "@/src/utils/clients";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return redirect("/404");
  }

  const set = await prismaClient.set.findFirst({
    where: {
      id: numberId,
    },
  });

  if (set === null) {
    return redirect("/404");
  }

  return (
    <div className="flex flex-col">
      <span className="dark:text-white text-2xl">Set: {set.name}</span>
      <span className="dark:text-white">
        This page has not been implemented yet!
      </span>
    </div>
  );
}
