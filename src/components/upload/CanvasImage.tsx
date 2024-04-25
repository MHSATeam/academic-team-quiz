/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ImgHTMLAttributes, forwardRef, useMemo } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import "@/src/assets/scss/custom-zoom.scss";

type CanvasImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  imageData: ImageData;
};

export default forwardRef<HTMLImageElement, CanvasImageProps>(
  function CanvasImage(props, ref) {
    const { imageData, ...rest } = props;
    const dataURL = useMemo(() => getImageDataUrl(imageData), [imageData]);
    return (
      <Zoom>
        <img ref={ref} {...rest} src={dataURL} />
      </Zoom>
    );
  },
);

function getImageDataUrl(imagedata: ImageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);

  return canvas.toDataURL("image/png");
}
