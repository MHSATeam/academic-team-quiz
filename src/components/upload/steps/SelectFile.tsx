import { StepComponentProps } from "@/components/pages/UploadSet";
import FileDrop from "@/components/upload/FileDrop";
import { Card } from "@tremor/react";

export default function SelectFile(props: StepComponentProps) {
  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 p-0">
      <FileDrop
        onReceiveFiles={(file) => {
          props.send({
            type: "addPdf",
            params: {
              newFile: file,
            },
          });
        }}
      />
    </Card>
  );
}
