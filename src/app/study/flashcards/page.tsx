import Flashcards from "@/components/pages/Flashcards";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[];
  };
}) {
  let categoryIds: number[] | undefined = undefined;
  let roundIds: number[] | undefined = undefined;
  if ("category" in searchParams) {
    const categories = Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category];
    categories.forEach((category) => {
      const id = parseInt(category);
      if (!Number.isNaN(id)) {
        if (categoryIds === undefined) {
          categoryIds = [];
        }
        categoryIds.push(id);
      }
    });
  }

  if ("round" in searchParams) {
    const rounds = Array.isArray(searchParams.round)
      ? searchParams.round
      : [searchParams.round];
    rounds.forEach((round) => {
      const id = parseInt(round);
      if (!Number.isNaN(id)) {
        if (roundIds === undefined) {
          roundIds = [];
        }
        roundIds.push(id);
      }
    });
  }

  return <Flashcards categories={categoryIds} rounds={roundIds} />;
}
