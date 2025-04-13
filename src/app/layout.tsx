import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import TopLoadingBar from "@/components/LoadingBar";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Insurance Claims System",
  description: "Manage your insurance claims efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TopLoadingBar />
          <Header />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
