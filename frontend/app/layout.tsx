import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { SearchModalProvider } from "@/lib/context/SearchModalContext";
import { GlobalErrorHandler } from "@/components/ErrorBoundary";
import Footer from "@/components/layout/STFooter";
import { FadeIn } from "@/components/FadeIn";
import { STHeader } from "@/components/STHeader";
import { STMobileNavBar } from "@/components/STMobileNavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sonotrade",
  description: "The future of entertainment",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/1024.png",
    apple: "/1024.png",
  },
  appleWebApp: {
    capable: true,
    title: "Sonotrade",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA / Add to Home Screen: explicit apple-touch-icon so iOS uses our logo instead of "S" fallback */}
        <link rel="apple-touch-icon" href="/1024.png" sizes="1024x1024" />
        <link rel="preload" href="/st-glyph.png" as="image" fetchPriority="high" />
        {/* Preconnect to GIF hosting domains for faster loading */}
        <link rel="preconnect" href="https://media.giphy.com" />
        <link rel="preconnect" href="https://media0.giphy.com" />
        <link rel="preconnect" href="https://media1.giphy.com" />
        <link rel="preconnect" href="https://media2.giphy.com" />
        <link rel="preconnect" href="https://media3.giphy.com" />
        <link rel="preconnect" href="https://media4.giphy.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent TronLink and other browser extension errors
              (function() {
                if (typeof window !== 'undefined') {
                  // Allow browser extensions to set properties on window
                  const originalDefineProperty = Object.defineProperty;
                  Object.defineProperty = function(obj, prop, descriptor) {
                    try {
                      return originalDefineProperty.call(this, obj, prop, descriptor);
                    } catch (e) {
                      console.warn('Property definition blocked:', prop, e);
                      return obj;
                    }
                  };

                  // Prevent Proxy trap errors from extensions like TronLink
                  window.addEventListener('error', function(e) {
                    if (e.message && (
                      e.message.includes('tronlinkParams') ||
                      e.message.includes('trap returned falsish') ||
                      e.filename && e.filename.includes('chrome-extension://')
                    )) {
                      e.preventDefault();
                      e.stopPropagation();
                      return true;
                    }
                  }, true);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <GlobalErrorHandler />
        <AuthProvider>
          <SearchModalProvider>
            {/* Preload critical images in hidden div to ensure they're in cache */}
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <img src="/st-glyph.png" alt="" width={48} height={48} />
            </div>
            <STHeader />
            <div
              className="mobile-bottom-nav-spacer"
              style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
            >
              {children}
            </div>
            <FadeIn>
              <Footer />
            </FadeIn>
            <STMobileNavBar />
          </SearchModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
