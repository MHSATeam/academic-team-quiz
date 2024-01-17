import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

type ScrollToTopProps = {
  top?: number;
};

export default function ScrollToTop(props: ScrollToTopProps) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setActive(document.documentElement.scrollTop >= (props.top ?? 300));
    };
    onScroll();
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <button
      onClick={() => {
        window.scrollTo({
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
