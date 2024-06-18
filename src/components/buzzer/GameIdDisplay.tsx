import classNames from "classnames";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
type GameIdDisplayProps = HTMLAttributes<HTMLDivElement> & {
  gameId: number;
  showLink?: boolean;
  size?: "lg" | "sm";
};

export default function GameIdDisplay(props: GameIdDisplayProps) {
  const { showLink, size, gameId, className, ...divProps } = Object.assign(
    { showLink: false, size: "sm" },
    props,
  );
  return (
    <div
      {...divProps}
      className={twMerge("flex flex-col items-center gap-1", className)}
    >
      <span
        className={classNames(
          "h-fit",
          "rounded-md",
          "bg-tremor-background-muted",
          "p-2",
          "text-tremor-content-emphasis",
          "dark:bg-dark-tremor-background-muted",
          "dark:text-dark-tremor-content-emphasis",
          {
            "text-5xl": size === "lg",
            "text-xl": size === "sm",
          },
        )}
      >
        Game ID:{" "}
        <b>{gameId.toString().split("").toSpliced(3, 0, " ").join("")}</b>
      </span>
      {showLink && (
        <span className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
          Join at <b>{location.host}/buzzer</b>
        </span>
      )}
    </div>
  );
}
