import { Metadata } from "next";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "../assets/scss/main.scss";
import { BottomNav } from "@/components/layout/BottomNav";

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
          <div className="pb-16 max-sm:pb-20 grow relative overflow-auto">
            {children}
          </div>
          <BottomNav />
          <Analytics />
        </body>
      </UserProvider>
    </html>
  );
}
