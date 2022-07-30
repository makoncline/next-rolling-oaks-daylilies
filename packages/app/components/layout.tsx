import React from "react";
import { createGlobalStyle } from "styled-components";
import Head from "next/head";
import Navigation from "./navigation";
import { SnackBarProvider } from "./snackBarProvider";
import { darkTheme } from "../styles/theme";
import { siteConfig } from "../siteConfig";
import { useRouter } from "next/router";
import { CartProvider } from "./cart";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const { title, description, baseUrl } = siteConfig;
  return (
    <CartProvider>
      <SnackBarProvider>
        <Head>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta property="og:site_name" content={title} />

          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`/assets/logo.png`} />
          <meta name="og:image:alt" content={`${title} logo`} />
          <meta property="og:url" content={baseUrl + pathname} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image:alt" content={`${title} logo`} />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <GlobalStyle />
        <Navigation />
        {children}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </SnackBarProvider>
    </CartProvider>
  );
};

export default Layout;

const GlobalStyle = createGlobalStyle`
:root{
  font-size: 18px;
}
html {
  box-sizing: border-box;
    --bg-5: ${darkTheme["bg-5"]};
    --bg-4: ${darkTheme["bg-4"]};
    --bg-3: ${darkTheme["bg-3"]};
    --bg-2: ${darkTheme["bg-2"]};
    --bg-1: ${darkTheme["bg-1"]};
    --bg-shine: ${darkTheme["bg-shine"]};
    --text-high: ${darkTheme["text-high"]};
    --text-low: ${darkTheme["text-low"]};

    --rgb-bg-5: 27, 39, 51;
    --rgb-blue: 80, 162, 255;
    --rgb-purple: 134, 126, 255;
    --rgb-peach: 242, 165, 117;
    --rgb-green: 105, 240, 174;
    --rgb-red: 255, 120, 120;
    --rgb-yellow: 251, 225, 144;
    --rgb-coral: 222, 137, 131;
    --green--vivid--100: hsla(152, 68.4%, 96.3%, 1);
    --green--vivid--200: hsla(154, 75.4%, 87.3%, 1);
    --green--vivid--300: hsla(156, 72.5%, 74.3%, 1);
    --green--vivid--400: hsla(158, 57.9%, 61.8%, 1);
    --green--vivid--500: hsla(160, 50.6%, 49.2%, 1);
    --green--vivid--600: hsla(162, 62.9%, 41.2%, 1);
    --green--vivid--700: hsla(164, 71.1%, 33.9%, 1);
    --green--vivid--800: hsla(166, 72.4%, 28.4%, 1);
    --green--vivid--900: hsla(168, 79.8%, 23.3%, 1);
    --green--vivid--1000: hsla(170, 97.4%, 15.3%, 1);
    --yellow--vivid--100: hsla(49, 100%, 95.9%, 1);
    --yellow--vivid--200: hsla(48, 100%, 88.4%, 1);
    --yellow--vivid--300: hsla(48, 95.1%, 76.1%, 1);
    --yellow--vivid--400: hsla(48, 93.9%, 67.6%, 1);
    --yellow--vivid--500: hsla(44, 91.6%, 62.5%, 1);
    --yellow--vivid--600: hsla(42, 86.9%, 55.1%, 1);
    --yellow--vivid--700: hsla(36, 76.9%, 49.2%, 1);
    --yellow--vivid--800: hsla(29, 79.6%, 44.3%, 1);
    --yellow--vivid--900: hsla(22, 81.8%, 38.8%, 1);
    --yellow--vivid--1000: hsla(15, 85.5%, 29.8%, 1);
    --pink--vivid--100: hsla(340, 93.1%, 94.3%, 1);
    --pink--vivid--200: hsla(338, 97.2%, 85.9%, 1);
    --pink--vivid--300: hsla(336, 96.6%, 77.3%, 1);
    --pink--vivid--400: hsla(335, 83.1%, 67.5%, 1);
    --pink--vivid--500: hsla(331, 77.5%, 56.5%, 1);
    --pink--vivid--600: hsla(329, 76.3%, 48%, 1);
    --pink--vivid--700: hsla(328, 78.8%, 40.8%, 1);
    --pink--vivid--800: hsla(325, 81.9%, 34.7%, 1);
    --pink--vivid--900: hsla(323, 82.2%, 28.6%, 1);
    --pink--vivid--1000: hsla(321, 90.1%, 19.8%, 1);
    --red--vivid--100: hsla(0, 100%, 94.5%, 1);
    --red--vivid--200: hsla(0, 100%, 87.1%, 1);
    --red--vivid--300: hsla(0, 100%, 80.4%, 1);
    --red--vivid--400: hsla(0, 91%, 69.4%, 1);
    --red--vivid--500: hsla(0, 83.4%, 62.2%, 1);
    --red--vivid--600: hsla(356, 75%, 52.9%, 1);
    --red--vivid--700: hsla(354, 84.8%, 43.9%, 1);
    --red--vivid--800: hsla(352, 90%, 35.3%, 1);
    --red--vivid--900: hsla(350, 94.4%, 27.8%, 1);
    --red--vivid--1000: hsla(348, 94%, 19.6%, 1);
    --cyan--100: hsla(186, 100%, 93.9%, 1);
    --cyan--200: hsla(185, 94%, 86.9%, 1);
    --cyan--300: hsla(184, 80.5%, 73.9%, 1);
    --cyan--400: hsla(184, 65.2%, 59.4%, 1);
    --cyan--500: hsla(185, 57.3%, 50.4%, 1);
    --cyan--600: hsla(185, 62.1%, 45.5%, 1);
    --cyan--700: hsla(184, 77.1%, 34.3%, 1);
    --cyan--800: hsla(185, 81.1%, 29%, 1);
    --cyan--900: hsla(185, 84.1%, 24.7%, 1);
    --cyan--1000: hsla(185, 90.9%, 17.3%, 1);
    --primary--100: hsla(206, 33.3%, 95.9%, 1);
    --primary--200: hsla(213, 32.1%, 89%, 1);
    --primary--300: hsla(210, 31.4%, 80%, 1);
    --primary--400: hsla(211, 26.8%, 70%, 1);
    --primary--500: hsla(209, 22.9%, 59.8%, 1);
    --primary--600: hsla(210, 21.8%, 48.6%, 1);
    --primary--700: hsla(209, 28%, 39.2%, 1);
    --primary--800: hsla(208, 34.6%, 30%, 1);
    --primary--900: hsla(212, 39.5%, 23.3%, 1);
    --primary--1000: hsla(209, 61.9%, 16.5%, 1);
    --light--blue--vivid--100: hsla(195, 100%, 94.5%, 1);
    --light--blue--vivid--200: hsla(195, 100%, 85.1%, 1);
    --light--blue--vivid--300: hsla(195, 96.9%, 74.9%, 1);
    --light--blue--vivid--400: hsla(196, 94%, 67.5%, 1);
    --light--blue--vivid--700: hsla(201, 78.9%, 46.5%, 1);
    --light--blue--vivid--500: hsla(197, 92%, 61%, 1);
    --light--blue--vivid--600: hsla(199, 84.3%, 54.9%, 1);
    --light--blue--vivid--800: hsla(202, 82.8%, 41%, 1);
    --light--blue--vivid--900: hsla(203, 87.4%, 34.1%, 1);
    --light--blue--vivid--1000: hsla(205, 95.7%, 27.1%, 1);
    --white: hsla(0, 0%, 100%, 1);
    --black: hsla(0, 0%, 0%, 1);
    /* Text-size styles */
    /* base size: typography---body 1 (16px) */
    --typography--h1: 6rem;
    --typography--h2: 3.75rem;
    --typography--h3: 3rem;
    --typography--h4: 2.12rem;
    --typography--h5: 1.5rem;
    --typography--h6: 1.25rem;
    --typography--subtitle-1: 1rem;
    --typography--subtitle-2: 0.88rem;
    --typography--body-1: 1rem;
    --typography--body-2: 0.88rem;
    --typography--button: 0.88rem;
    --typography--caption: 0.75rem;
    --typography--overline: 0.62rem;

    /* Effect styles */
    --raised: 0px 1px 3px rgba(0, 0, 0, 0.2),
      inset 0px 1px 0px rgba(255, 255, 255, 0.2);
    --inset: 0px 1px 0px rgba(255, 255, 255, 0.2),
      inset 0px 1px 2px rgba(0, 0, 0, 0.1);
    --elevation--1: 0px 1px 3px rgba(0, 0, 0, 0.12),
      0px 4px 4px rgba(0, 0, 0, 0.25);
    --elevation--2: 0px 3px 6px rgba(0, 0, 0, 0.15),
      0px 4px 4px rgba(0, 0, 0, 0.25);
    --elevation--3: 0px 3px 6px rgba(0, 0, 0, 0.1),
      0px 10px 20px rgba(0, 0, 0, 0.15);
    --elevation--4: 0px 5px 10px rgba(0, 0, 0, 0.05),
      0px 15px 25px rgba(0, 0, 0, 0.15);
    --elevation--5: 0px 20px 40px rgba(0, 0, 0, 0.2);

    scroll-behavior: smooth;
    font-family: Lato, sans-serif ;
    font-weight: normal;
    font-style: normal;
}
*, *:before, *:after {
  box-sizing: inherit;
}
.button {
    font-weight: 500;
    font-size: var(--typography--button);
    letter-spacing: 1.25px;
    text-transform: uppercase;
  }
body{
  margin:0;
  background-color: ${darkTheme["bg-5"]};
  color: ${darkTheme["text-high"]};
}
h1,h2,h3,h4,h5,h6{
  color: ${darkTheme["text-high"]};
}
label{
  color: ${darkTheme["text-low"]};
}
p{
  color:${darkTheme["text-high"]};
}
a{
  &:link{

  color: rgb(var(--rgb-blue));
  }
  &:visited{
    color: rgb(var(--rgb-purple));
  }
  &:hover{
    color: rgb(var(--rgb-purple));
  }
  &:active{
    color: rgb(var(--rgb-coral));
  }
}
.text--high{
  color: ${darkTheme["text-high"]};
}
.text--low{
  color: ${darkTheme["text-low"]};
}
`;
