import "./globals.css";
import AppProviders from "./providers";

export const metadata = {
  title: "MassoudNet",
  description: "Your social network app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/emoji-picker-react/dist/universal/style.css"
        />
      </head>
      <body>
        {/* Wrap all pages in providers */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
