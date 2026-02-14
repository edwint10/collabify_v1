import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import MainNav from "@/components/navigation/main-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hyperbrandz - Where marketers and brands click, trust, and collaborate",
  description: "The first platform built to bring trust, clarity, and speed to brand–creator collaborations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MainNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


