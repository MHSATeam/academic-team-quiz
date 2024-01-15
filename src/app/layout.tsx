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
    <html lang="en">
      <head>
        <link
          rel="manifest"
          href="manifest.json"
          crossOrigin="use-credentials"
        />
      </head>
      <UserProvider>
        <body>
          <div id="app">{children}</div>
          <Analytics />
        </body>
      </UserProvider>
    </html>
  );
}
