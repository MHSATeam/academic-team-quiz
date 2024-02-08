import { Card, Grid } from "@tremor/react";

export default function Page() {
  return (
    <main className="px-6 py-12">
      <Grid numItems={1} numItemsLg={3} numItemsMd={2}>
        <Card></Card>
      </Grid>
    </main>
  );
}
