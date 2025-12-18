import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AvailabilityProvider } from '@/contexts/AvailabilityContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar Availability",
  description: "Instructor calendar availability system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AvailabilityProvider>
          {children}
        </AvailabilityProvider>
      </body>
    </html>
  );
}
