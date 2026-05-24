import type { Metadata } from "next";
import "./globals.css";
import NotificationInit from "@/components/NotificationInit";

export const metadata: Metadata = {
  title: "Contact Lens Tracker",
  description: "Track your contact lenses, prescription, and inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <NotificationInit />
        {children}
      </body>
    </html>
  );
}
