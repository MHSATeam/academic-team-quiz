import { Button, Flex, Metric, TextInput, Title } from "@tremor/react";
import { Search } from "lucide-react";

export default async function Page({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  return (
    <Flex
      flexDirection="col"
      className="gap-4"
      alignItems="start"
      justifyContent="start"
    >
      <Metric>Question Search</Metric>
      <form method="GET" action="/static/question">
        <Flex alignItems="stretch">
          <TextInput
            id="search"
            name="search"
            placeholder="Search"
            defaultValue={searchParams.search}
            className="rounded-r-none border-r-0"
          />
          <Button type="submit" className="rounded-l-none border-l-0">
            <Search />
          </Button>
        </Flex>
      </form>
    </Flex>
  );
}
