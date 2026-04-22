import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../components/provider/QueryProvider.jsx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "OSINT Intelligence Engine",
  description: "Multi-Vector Intelligence & Entity Resolution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
