import { Inter } from "next/font/google";
import "./globals.css";

import { SplashScreen } from "@/components/ui/splash-screen";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "ResoluCity",
  description: "Community Hero - Hyperlocal Problem Solver",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SplashScreen>
          {children}
        </SplashScreen>
      </body>
    </html>
  );
}
