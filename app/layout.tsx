import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import RootProvider from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TiffinCrate - Fresh Home-Cooked Meals Delivered",
  description:
    "Connect with local tiffin providers and enjoy delicious, healthy meals delivered to your doorstep",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        />
      </head>
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
