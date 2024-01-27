import { Metadata } from "next";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "../assets/scss/main.scss";

export const metadata: Metadata = {
  title: "Academic Quiz",
  description: "One-stop-shop for all things Madeira Academic Team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="manifest"
          href="/manifest.json"
          crossOrigin="use-credentials"
        />
      </head>
      <UserProvider>
        <body className="h-full flex flex-col dark:bg-slate-800">
          {children}
          <Analytics />
        </body>
      </UserProvider>
    </html>
  );
}
