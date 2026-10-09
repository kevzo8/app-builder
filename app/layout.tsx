import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";
import ThemeInitScript from "../components/ThemeInitScript";

const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono2", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "DreamBuild — Build Your Dream Apps, Offline",
  description: "Local-AI app builder for SMBs, teachers, clinics, creators. Private, free, offline-first.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        <ThemeInitScript />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
