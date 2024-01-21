import { Button } from "@tremor/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col p-8 md:mx-32 mx-auto gap-2">
      <h2 className="text-2xl dark:text-white">
        404 This page could not be found!
      </h2>
      <Button className="w-fit">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
