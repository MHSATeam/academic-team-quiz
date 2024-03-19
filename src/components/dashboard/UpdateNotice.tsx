"use client";
import { Button, Dialog, DialogPanel, Flex, Text, Title } from "@tremor/react";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "seen-update";
const UPDATE_ID = "new-streak-system";
const UPDATE_ENABLED = true;
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
            Streaks are now based on how many questions you answer, NOT how many
            quizzes you complete!
          </Text>
          <Text>
            If you think your current streak has been affected by this change,
            contact Nate Wagner{" "}
            <a
              autoFocus={false}
              className="text-tremor-brand dark:text-dark-tremor-brand"
              href="mailto:nathaniel.wagner.student@madeiracityschools.org"
            >
              here
            </a>
            .
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
