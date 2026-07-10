import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudHost - All-in-One Cloud Platform",
  description: "Hosting, databases, workflows, WordPress & more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
