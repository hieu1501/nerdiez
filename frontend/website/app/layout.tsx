import type { Metadata } from "next";
import "@fontsource/ia-writer-quattro/400.css";
import "@fontsource/ia-writer-quattro/400-italic.css";
import "@fontsource/ia-writer-quattro/700.css";
import "@fontsource/ia-writer-quattro/700-italic.css";
import "./globals.css";
import Header from "./header";

export const metadata: Metadata = {
  title: "Nerdy",
  description:
    "Short, honest notes on computer science and economics for curious developers.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          type="text/javascript"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="w-full border-t border-line px-5 py-8 sm:px-8">
            <p className="mx-auto max-w-[960px] text-center text-sm text-muted">
              Nerdy — notes on computer science and economics.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
