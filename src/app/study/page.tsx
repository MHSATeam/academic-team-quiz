import { Card, Flex, Grid, Metric, Title } from "@tremor/react";
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
      name: "Test",
      icon: FileText,
      href: "/study/quiz-session?type=Test",
    },
    {
      name: "Math",
      icon: Sigma,
      href: "/study/math",
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
          return (
            <Link href={link.href} key={link.name}>
              <Card className="hover:bg-blue-500">
                <Flex flexDirection="col" className="gap-2">
                  <Icon className="dark:text-white" />
                  <Title className="text-center">{link.name}</Title>
                </Flex>
              </Card>
            </Link>
          );
        })}
      </Grid>
    </main>
  );
}
