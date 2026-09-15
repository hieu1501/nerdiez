import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/ia-writer-quattro/400.css";
import "@fontsource/ia-writer-quattro/400-italic.css";
import "@fontsource/ia-writer-quattro/700.css";
import "@fontsource/ia-writer-quattro/700-italic.css";
import "./globals.css";
import { AuthProvider } from "./auth-provider";
import AppShell from "./app-shell";

export const metadata: Metadata = {
  title: "Nerdy",
  description:
    "Articles, questions, and subject-based explanations on computer science and economics for curious minds.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children, articleModal }: { children: ReactNode; articleModal: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
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
