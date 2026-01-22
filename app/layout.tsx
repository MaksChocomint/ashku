import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Симулятор терпения",
  description: "Попробуй дожить до конца",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${rubik.variable} font-main antialiased bg-[#0f172a] text-slate-200 min-h-screen selection:bg-purple-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
