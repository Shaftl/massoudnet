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
        {/* Fonts */}
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

        {/* Emoji Picker */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/emoji-picker-react/dist/universal/style.css"
        />

        {/* PWA Manifest & Meta */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0055FF" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>

      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
