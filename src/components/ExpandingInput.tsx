// Imported from https://github.com/flynow10/fmplayer
import { forwardRef, InputHTMLAttributes } from "react";

type MakeRequired<Type, Key extends keyof Type> = Type & {
  [P in Key]-?: Type[P];
};

export default forwardRef<
  HTMLInputElement,
  MakeRequired<InputHTMLAttributes<HTMLInputElement>, "value">
>(function ExpandingInput(props, ref) {
  return (
    <div className="inline-block relative">
      <span
        className={props.className}
        style={{
          display: "inline-block",
          visibility: "hidden",
          whiteSpace: "pre",
        }}
      >
        {typeof props.value === "number"
          ? props.value
          : props.value || props.placeholder}
      </span>
      <input
        ref={ref}
        {...props}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          ...props.style,
        }}
      />
    </div>
  );
});
