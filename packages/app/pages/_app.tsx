import { CartProvider } from "components/cart";
import { SnackBarProvider } from "components/snackBarProvider";
import type { AppProps } from "next/app";
import React from "react";
import "../styles/index.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <SnackBarProvider>
        <Component {...pageProps} />
      </SnackBarProvider>
    </CartProvider>
  );
}

export default MyApp;
