import { sanitize } from "@/src/lib/questions/dom-purify";
import { HTMLAttributes, useMemo } from "react";

type DisplayFormattedTextProps = Omit<
  HTMLAttributes<HTMLParagraphElement>,
  "children" | "dangerouslySetInnerHTML"
> & {
  text: string;
  element?: "p" | "span" | "div";
};

export default function DisplayFormattedText(props: DisplayFormattedTextProps) {
  const { text: dangerousHTML, element, ...rest } = props;
  const Element = element ?? "p";
  const sanitizedHtml = useMemo(() => {
    return sanitize(dangerousHTML);
  }, [dangerousHTML]);
  return (
    <Element
      {...rest}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    ></Element>
  );
}
