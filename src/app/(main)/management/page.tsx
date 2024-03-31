import { Card, Flex, Grid, Title } from "@tremor/react";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="px-6 py-12">
      <Grid numItems={1} numItemsLg={3} numItemsMd={2}>
        <Link href={"management/upload"}>
          <Card className="hover:bg-blue-500">
            <Flex flexDirection="col">
              <Upload className="dark:text-white" />
              <Title>Upload Sets</Title>
            </Flex>
          </Card>
        </Link>
      </Grid>
    </main>
  );
}
