import { Button, Flex } from "@tremor/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LinkToBox() {
  const pathname = usePathname();
  if (pathname.includes("buzzer-display")) {
    return null;
  }
  return (
    <div className="absolute bottom-0 right-0 m-2 hidden flex-col gap-2 md:flex">
      <span className="text-white">Looking for other pages?</span>
      <Flex className="gap-2">
        <Link href={"/buzzer-box"}>
          <Button>Host a game</Button>
        </Link>
        <Link href={"/buzzer-display"}>
          <Button>Display score</Button>
        </Link>
      </Flex>
    </div>
  );
}
