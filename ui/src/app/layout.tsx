import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { ClawUIProvider } from "@/core/providers/ClawUIProvider";
import { RelayProvider } from "@/core/providers/RelayContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ClawUI Starter Kit",
  description: "Build AI-powered UIs with CopilotKit + OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RelayProvider>
          <ClawUIProvider>{children}</ClawUIProvider>
        </RelayProvider>
      </body>
    </html>
  );
}
