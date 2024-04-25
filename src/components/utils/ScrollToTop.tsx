import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

type ScrollToTopProps = {
  top?: number;
  scrollParent?: React.RefObject<HTMLElement>;
};

export default function ScrollToTop(props: ScrollToTopProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const parent =
      props.scrollParent && props.scrollParent.current
        ? props.scrollParent.current
        : document.documentElement;
    const onScroll = () => {
      setActive(parent.scrollTop >= (props.top ?? 300));
    };
    onScroll();
    parent.addEventListener("scroll", onScroll);
    return () => {
      parent.removeEventListener("scroll", onScroll);
    };
  }, [props.scrollParent, props.top]);

  return (
    <button
      onClick={() => {
        const parent =
          props.scrollParent && props.scrollParent.current
            ? props.scrollParent.current
            : window;
        parent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      tabIndex={-1}
      className={
        "fixed m-2 p-2 max-sm:bottom-20 bottom-16 right-0 rounded-lg border-2 bg-slate-400 active:scale-95 transition-opacity" +
        (active ? " opacity-50" : " opacity-0")
      }
    >
      <ArrowUp />
    </button>
  );
}
