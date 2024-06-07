import {
  Button,
  Dialog,
  DialogPanel,
  Flex,
  Tab,
  TabGroup,
  TabList,
  TextInput,
  Title,
} from "@tremor/react";
import React, { useCallback, useState } from "react";

type SettingsDialogProps = {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  team: string;
  setTeam: React.Dispatch<React.SetStateAction<string>>;
};

export default function SettingsDialog(props: SettingsDialogProps) {
  const [tempName, setTempName] = useState(props.name);
  const { setName, setOpen, setTeam } = props;
  const save = useCallback(() => {
    if (tempName.length > 0) {
      setName(tempName);
      setOpen(false);
    }
  }, [tempName, setName, setOpen]);
  return (
    <Dialog open={props.isOpen} onClose={save}>
      <DialogPanel>
        <Flex flexDirection="col" alignItems="start" className="gap-4">
          <Title>Settings</Title>
          <div>
            <label>Name</label>
            <TextInput
              value={tempName}
              onValueChange={setTempName}
              placeholder="Name"
              maxLength={40}
              required
              className="has-[>input:invalid]:border-red-500"
              style={{
                fontSize: "1.125rem",
              }}
            />
          </div>
          <div>
            <label>Team</label>
            <TabGroup
              className="mb-4"
              index={props.team === "a" ? 0 : 1}
              onIndexChange={(index) => {
                setTeam(index === 0 ? "a" : "b");
              }}
            >
              <TabList variant="solid">
                <Tab key={"a"}>Team A</Tab>
                <Tab key={"b"}>Team B</Tab>
              </TabList>
            </TabGroup>
          </div>
          <Button color="green" onClick={save}>
            Save
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
