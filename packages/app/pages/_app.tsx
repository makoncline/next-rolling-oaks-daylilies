import { CartProvider } from "components/cart";
import { SnackBarProvider } from "components/snackBarProvider";
import type { AppProps } from "next/app";
import React from "react";
import { Figtree } from "next/font/google";
import "../styles/index.css";

// Self-hosted at build time by next/font; no browser requests to Google.
const figtree = Figtree({ subsets: ["latin"], display: "swap", variable: "--font-body" });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div id="app-root" className={`${figtree.variable} font-sans`}>
      <CartProvider>
        <SnackBarProvider>
          <Component {...pageProps} />
        </SnackBarProvider>
      </CartProvider>
    </div>
  );
}

export default MyApp;
