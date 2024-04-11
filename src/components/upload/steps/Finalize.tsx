import { StepComponentProps } from "@/components/pages/UploadSet";
import { Card } from "@tremor/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Finalize(props: StepComponentProps) {
  const { context } = props.state;

  return (
    <Card className="absolute left-1/2 top-1/2 flex w-1/3 -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      {!context.hasUploaded && (
        <div className="flex items-center gap-2 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
          Uploading <Loader2 className="animate-spin" />
        </div>
      )}
      {context.error !== undefined && (
        <div className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
          Error:
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(context.error, null, 2)}
          </pre>
        </div>
      )}
      {context.uploadedObj && (
        <div className="flex flex-col items-center gap-2 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
          <span className="text-tremor-title text-green-500">
            Successfully uploaded set!
          </span>
          <Link
            className="text-blue-500"
            href={
              "author" in context.uploadedObj
                ? `/static/set/${context.uploadedObj.id}`
                : `/static/round/${context.uploadedObj.id}`
            }
          >
            Go to set
          </Link>
        </div>
      )}
    </Card>
  );
}
