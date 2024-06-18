"use client";
import { Category } from "@prisma/client";
import {
  BarList,
  BarListProps,
  Flex,
  Tab,
  TabGroup,
  TabList,
  Title,
} from "@tremor/react";
import { useMemo, useState } from "react";

type CategoriesAnsweredDonutProps = {
  categories: (Category & { questionCount: number; correctCount: number })[];
};
const toBar =
  (key: "questionCount" | "correctCount") =>
  (
    categories: CategoriesAnsweredDonutProps["categories"],
  ): BarListProps["data"] =>
    categories.map((c) => ({
      name: c.name,
      value: c[key],
      href: `/static/category/${c.id}`,
    }));

export default function CategoriesAnsweredDonut(
  props: CategoriesAnsweredDonutProps,
) {
  const [showMode, setShowMode] = useState<"all" | "correct">("all");

  const barData = useMemo(
    () =>
      toBar(showMode === "all" ? "questionCount" : "correctCount")(
        props.categories
          .slice()
          .sort((a, b) => b.questionCount - a.questionCount),
      ),
    [showMode, props.categories],
  );
  return (
    <div className="flex flex-col gap-2">
      <Flex>
        <Title>Questions Answered By Category</Title>
        <TabGroup
          className="w-fit"
          onIndexChange={(index) =>
            setShowMode(index === 0 ? "all" : "correct")
          }
          index={showMode === "all" ? 0 : 1}
        >
          <TabList variant="solid">
            <Tab>All</Tab>
            <Tab>Correct</Tab>
          </TabList>
        </TabGroup>
      </Flex>
      {barData.length === 0 && (
        <Title>You haven&apos;t answered any questions!</Title>
      )}
      <BarList data={barData} showAnimation />
    </div>
  );
}
