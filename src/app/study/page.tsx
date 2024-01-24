import { Card, Flex, Grid, Metric, Subtitle, Title } from "@tremor/react";
import { FileText, FolderSearch, Layers, Pencil, Sigma } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const links = [
    {
      name: "Flashcards",
      icon: Layers,
      href: "/study/quiz-session?type=Flashcards",
    },
    {
      name: "Writing",
      icon: Pencil,
      href: "/study/quiz-session?type=Written",
    },
    {
      name: "Math",
      icon: Sigma,
      href: "/study/math",
    },
    {
      name: "Test",
      icon: FileText,
      href: "/study/quiz-session?type=Test",
      comingSoon: true,
    },
    {
      name: "Round Explorer",
      icon: FolderSearch,
      href: "/static/round",
    },
  ];
  return (
    <main className="py-12 px-6">
      <Metric className="mb-4">Study Tools</Metric>
      <Grid numItems={2} numItemsLg={3} className="gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          const card = (
            <Card
              key={link.name}
              className={
                link.comingSoon
                  ? "bg-tremor-background-muted dark:bg-dark-tremor-background-muted relative overflow-hidden"
                  : "hover:bg-blue-500"
              }
            >
              <Flex flexDirection="col" className="gap-2">
                <Icon className="dark:text-white" />
                <Title className="text-center">{link.name}</Title>
              </Flex>
              {link.comingSoon && (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-300 dark:bg-gray-700 bg-opacity-75 dark:bg-opacity-75">
                  <Subtitle color="red">Coming Soon!</Subtitle>
                </div>
              )}
            </Card>
          );
          if (link.comingSoon) {
            return card;
          }
          return (
            <Link href={link.href} key={link.name}>
              {card}
            </Link>
          );
        })}
      </Grid>
    </main>
  );
}
