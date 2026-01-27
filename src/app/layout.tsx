import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { VibeKanbanWebCompanionWrapper } from "~/components/VibeKanbanWebCompanionWrapper";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const sourceSans = Source_Sans_3({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "La Mancha - Festival de Música Emergente",
  description: "Un espacio para el arte y la música emergente",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${libreBaskerville.variable} ${sourceSans.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
        <VibeKanbanWebCompanionWrapper />
      </body>
    </html>
  );
}
