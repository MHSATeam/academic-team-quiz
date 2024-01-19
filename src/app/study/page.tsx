import { Card, Flex, Grid, Metric, Title } from "@tremor/react";
import { Layers, Sigma } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const links = [
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
            <Link href={link.href}>
              <Card className="hover:bg-blue-500">
                <Flex flexDirection="col" className="gap-2">
                  <Icon className="dark:text-white" />
                  <Title>{link.name}</Title>
                </Flex>
              </Card>
            </Link>
          );
        })}
      </Grid>
    </main>
  );
}
