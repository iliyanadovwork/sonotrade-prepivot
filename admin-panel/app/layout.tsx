import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADMIN Sonotrade",
  description: "Sonotrade Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

