import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";
import MotionProvider from "@/components/MotionProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Autoescuela Faro Málaga | Permiso B sin letra pequeña",
  description:
    "Autoescuela Faro en Málaga. Permiso B con precio real sin letra pequeña, 3 profesores, 4 coches con doble mando, reservas de prácticas desde el móvil y cola de examen transparente.",
  icons: {
    icon: "/icono-faro.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plusJakarta.variable} scroll-smooth`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-primary/15 selection:text-primary">
        <MotionProvider />
        <Header />
        <main className="w-full pt-20 bg-surface min-h-[calc(100vh-280px)]">
          {children}
        </main>
        <ChatAssistant />
        <Footer />
      </body>
    </html>
  );
}
