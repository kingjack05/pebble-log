import React from "react";
import Svg, { Path, SvgProps, Circle } from "react-native-svg";
import { cssInterop } from "nativewind";

cssInterop(Svg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      width: true,
      height: true,
      fill: true,
    },
  },
});

/**
 * Icons from feather icons. https://feathericons.com
 * Converted from svg with https://react-svgr.com/playground/?native=true&typescript=true
 */

export const TaskOpenIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
  </Svg>
);
export const TaskDoneIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Path d="M22 4 12 14.01l-3-3" />
  </Svg>
);
export const EventIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);
export const NoteIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-minus"
    {...props}
  >
    <Path d="M5 12h14" />
  </Svg>
);
export const GratitudeIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);
export const WinIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);
export const UndefinedIcon = (props: SvgProps) => {
  const radius = 10;
  const dashLength = (2 * Math.PI * radius) / 36;

  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeDasharray={dashLength}
      strokeWidth={2}
      {...props}
    >
      <Circle cx={12} cy={12} r={radius} />
    </Svg>
  );
};
export const NullIcon = (props: SvgProps) => {
  return <Svg {...props} />;
};

export const BulletTypeToIcon = {
  "task.open": TaskOpenIcon,
  "task.done": TaskDoneIcon,
  event: EventIcon,
  note: NoteIcon,
  gratitude: GratitudeIcon,
  win: WinIcon,
  undefined: UndefinedIcon,
  null: NullIcon,
} as const;
