import React from "react";

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-8 md:mx-32 mx-auto">{children}</div>;
}
