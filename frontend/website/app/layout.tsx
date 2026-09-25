import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth-provider";
import AppShell from "./app-shell";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: { default: "Nerdiez", template: "%s · Nerdiez" },
  description:
    "Articles, questions, and subject-based explanations on computer science and economics for curious minds.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1214" },
  ],
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children, articleModal }: { children: ReactNode; articleModal: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${code.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          type="text/javascript"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          {articleModal}
        </AuthProvider>
      </body>
    </html>
  );
}
