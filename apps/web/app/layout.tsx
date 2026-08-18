import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University LMS",
  description: "Learning Management System for university administration, attendance, timetable, exams, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
