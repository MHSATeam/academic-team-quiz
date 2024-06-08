"use client";

import { Button, Flex, Subtitle } from "@tremor/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const pageNumber = Number(searchParams.get("page") ?? "1");
  const isAtFirstPage = pageNumber === 1;
  const isAtLastPage = pageNumber === totalPages;

  const changePageNumber = useCallback(
    (change: number) => {
      router.replace(
        pathname +
          "?" +
          createQueryString(
            "page",
            Math.max(1, Math.min(pageNumber + change, totalPages)).toString(),
          ),
      );
    },
    [router, pathname, createQueryString, pageNumber, totalPages],
  );

  return (
    <Flex justifyContent="center" className="mb-2 mt-4 flex-wrap gap-2">
      <Button
        disabled={isAtFirstPage}
        variant="secondary"
        size="xs"
        onClick={() => {
          changePageNumber(1 - pageNumber);
        }}
      >
        <Flex justifyContent="center">
          <ChevronLeft />
          <ChevronLeft />
        </Flex>
      </Button>
      <Button
        disabled={isAtFirstPage}
        variant="secondary"
        size="xs"
        onClick={() => {
          changePageNumber(-1);
        }}
      >
        <ChevronLeft />
      </Button>
      <Subtitle className="shrink-0">
        {pageNumber} of {totalPages}
      </Subtitle>
      <Button
        disabled={isAtLastPage}
        variant="secondary"
        size="xs"
        onClick={() => {
          changePageNumber(1);
        }}
      >
        <ChevronRight />
      </Button>
      <Button
        disabled={isAtLastPage}
        variant="secondary"
        size="xs"
        onClick={() => {
          changePageNumber(totalPages);
        }}
      >
        <Flex justifyContent="center">
          <ChevronRight />
          <ChevronRight />
        </Flex>
      </Button>
    </Flex>
  );
}
