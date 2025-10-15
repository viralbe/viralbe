import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SafeHydrate from "@/components/SafeHydrate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vídeos Virais com IA",
  description: "Descubra e recrie vídeos virais automaticamente com IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{ layout: { logoPlacement: "none" } }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="pt-BR">
        <body suppressHydrationWarning={true}>
          <SafeHydrate>{children}</SafeHydrate>
        </body>
      </html>
    </ClerkProvider>
  );
}
