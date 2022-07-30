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
  return <Component {...pageProps} />;
}

export default MyApp;
