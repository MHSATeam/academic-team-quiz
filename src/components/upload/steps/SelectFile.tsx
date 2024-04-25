import { StepComponentProps } from "@/components/pages/UploadSet";
import FileDrop from "@/components/upload/FileDrop";
import { Card, Flex, Subtitle, Text, Title } from "@tremor/react";
import Link from "next/link";

const packetResourceLinks: { name: string; href: string }[] = [
  {
    name: "Ohio Academic Competition Regional & State Sets",
    href: "https://www.ohioacademiccompetition.com/resources-and-links/question-sets",
  },
  {
    name: "High School Quizbowl Packet Archive",
    href: "https://quizbowlpackets.com/",
  },
];

export default function SelectFile(props: StepComponentProps) {
  return (
    <Flex flexDirection="col" className="my-auto w-fit gap-4">
      <Card>
        <Title>Set Upload Tool</Title>
        <Text>
          This tool is for adding questions sets to our database. <br /> They
          will be shown in flashcards and be avalible as practice sets on the
          buzzer page.
        </Text>
      </Card>
      <Card className="p-0">
        <FileDrop
          onReceiveFiles={async (file) => {
            props.send({
              type: "addPdf",
              params: {
                newFile: file,
              },
            });
          }}
        />
      </Card>
      <Card>
        <Title>Not sure where to start?</Title>
        <Subtitle className="mb-2">
          You can find some question sets here
        </Subtitle>
        <ul>
          {packetResourceLinks.map((resource, index) => (
            <li key={index}>
              <Link className="text-blue-500 underline" href={resource.href}>
                {resource.name}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </Flex>
  );
}
