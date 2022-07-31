import { FormValuesProvider } from "@packages/design-system";
import { CartProvider } from "components/cart";
import { SnackBarProvider } from "components/snackBarProvider";
import type { AppProps } from "next/app";
import React from "react";
import "../styles/index.css";
function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <FormValuesProvider>
      <CartProvider>
        <SnackBarProvider>
          <Component {...pageProps} />
        </SnackBarProvider>
      </CartProvider>
    </FormValuesProvider>
  );
}

export default MyApp;
