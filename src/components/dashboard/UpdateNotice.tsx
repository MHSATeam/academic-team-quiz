"use client";
import { Button, Dialog, DialogPanel, Flex, Text, Title } from "@tremor/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "seen-update";
const UPDATE_ID = "new-question-search";
const UPDATE_ENABLED = false;
const isServer = typeof window === "undefined";

export default function UpdateNotice() {
  const [isOpen, setIsOpen] = useState(() => UPDATE_ENABLED);

  const initialize = () => {
    if (isServer) {
      return UPDATE_ENABLED;
    }
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item === UPDATE_ID) {
      return false;
    }
    return UPDATE_ENABLED;
  };

  useEffect(() => {
    if (!isServer) {
      setIsOpen(initialize());
    }
  }, []);

  const onClose = () => {
    setIsOpen(false);
    if (!isServer) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, UPDATE_ID);
    }
  };

  return (
    <Dialog
      open={isOpen}
      unmount={false}
      onClick={(e) => {
        e.preventDefault();
      }}
      onClose={() => {
        onClose();
      }}
    >
      <DialogPanel>
        <Flex flexDirection="col" className="gap-4" alignItems="start">
          <Title>There has been an update!</Title>
          <Text>
            There is now a question search page! You can find it{" "}
            <Link href={"/static/question"} className="text-blue-500">
              here
            </Link>{" "}
            or under the study tab.
          </Text>
          <Button
            onClick={() => {
              onClose();
            }}
          >
            Got it!
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
