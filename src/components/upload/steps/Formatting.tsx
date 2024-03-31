import { StepComponentProps } from "@/components/pages/UploadSet";
import { Title } from "@tremor/react";
import { ImgHTMLAttributes, forwardRef, useMemo } from "react";

export default function Formatting(props: StepComponentProps) {
  const questions = props.state.context.questions;

  return (
    <div className="flex flex-col gap-2 overflow-auto">
      {questions.map((question, index) => {
        return (
          <div key={question.id}>
            <Title>Question #{index + 1}</Title>
            {question.questionImages.map((imageData, index) => {
              return (
                <CanvasImage
                  className="border"
                  width={1000}
                  imageData={imageData}
                  key={question.id + index}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

type CanvasImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  imageData: ImageData;
};

const CanvasImage = forwardRef<HTMLImageElement, CanvasImageProps>(
  function CanvasImage(props, ref) {
    const dataURL = useMemo(
      () => getImageDataUrl(props.imageData),
      [props.imageData]
    );
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img ref={ref} {...props} src={dataURL} />;
  }
);

function getImageDataUrl(imagedata: ImageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);

  return canvas.toDataURL("image/png");
}
