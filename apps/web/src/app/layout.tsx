import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

export const metadata: Metadata = {
  title: "Catalyst Terminal | Intelligent Solana Event Automation",
  description: "Real-time Solana token intelligence, automated alerts, and on-chain signal detection.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const urlParams = new URLSearchParams(window.location.search);
                const ref = urlParams.get('ref');
                if (ref) {
                  localStorage.setItem('referral_code', ref);
                }
              })();
            `,
          }}
        />
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
