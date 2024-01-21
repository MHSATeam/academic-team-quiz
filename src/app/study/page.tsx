import { Card, Flex, Grid, Metric, Title } from "@tremor/react";
import { FolderSearch, Layers, Sigma } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const links = [
    {
      name: "Round Explorer",
      icon: FolderSearch,
      href: "/static/round",
    },
    {
      name: "Flashcards",
      icon: Layers,
      href: "/study/flashcards",
    },
    {
      name: "Math",
      icon: Sigma,
      href: "/study/math",
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
