import React, { useRef } from "react";
import Layout from "../components/layout";
import ContactForm from "../components/contactForm";
import type { NextPage } from "next";
import Image from "next/image";

import logoSquare from "../public/assets/logo.png";
import home1 from "../public/assets/home-1.jpeg";
import home2 from "../public/assets/home-2.jpg";
import home3 from "../public/assets/home-3.jpeg";
import { Heading, Space } from "@packages/design-system";
import Link from "next/link";

const Home: NextPage = () => {
  const contactFormRef = useRef<HTMLDivElement>(null);
  return (
    <Layout>
      <Space responsive gap="small" center>
        <Image
          src={logoSquare}
          placeholder="blur"
          alt="Rolling Oaks Daylilies logo"
        />
        <Space direction="column" as="section">
          <Heading level={1}>Welcome to Rolling Oaks Daylilies</Heading>
          <p>
            I grow approximately 1000 named daylilies and a few thousand of my
            own seedlings. My collection includes a wide variety of forms,
            including spiders, unusual forms, and doubles. My current
            hybridizing focus is double and white daylilies. I have been an AHS
            Display Garden for several years.
          </p>
          <Space direction="column" block>
            <Space responsive block>
              <button onClick={() => contactFormRef.current?.scrollIntoView()}>
                Send me a message
              </button>
              <Link href="https://goo.gl/maps/BKg722pc9e52" target="_blank">
                <button>Get directions</button>
              </Link>
            </Space>
            <span>
              Give me a call: <a href="tel:+1-601-590-1349">1-601-590-1349</a>
            </span>
          </Space>
        </Space>
      </Space>

      <Image
        src={home1}
        placeholder="blur"
        alt="Rolling Oaks Daylilies Landscape"
      />

      <Space direction="column" block as="section">
        <Heading level={2}>Ordering</Heading>
        <Space direction="column" block>
          <p>
            Minimum order is $20.00. The list price is for a double fan. A
            double fan can sometimes share one root system and dormant plants
            can be small here. Shipped bare root. Please send me a message, or
            email me to check availability prior to payment at{" "}
            <a href="mailto:kaymcline@gmail.com">kaymcline@gmail.com</a>.
            Sometimes, I may be able to sell a daylily that is listed as
            {`"`}display only{`"`} (list will not show a price or shopping cart
            button). I accept checks made payable to Kay Cline or Paypal payment
            to kaymcline@gmail.com and can send a PayPal Invoice if you want. I
            also accept Venmo (@Karen-Cline-13).
          </p>
          <p>
            <strong>Please note</strong>,{" "}
            <a href="https://www.daylilies.org/ahs_dictionary/daylily_rust.html">
              Daylily Rust
            </a>{" "}
            can overwinter in our mild southern climate. I cannot gaurantee
            rust-free plants.
          </p>
        </Space>
      </Space>

      <Image
        src={home2}
        placeholder="blur"
        alt="Rolling Oaks Daylilies Landscape"
      />

      <Space direction="column" block as="section">
        <Heading level={2}>Shipping</Heading>
        <p>
          I ship Priority Mail (USPS) the same day I dig, Monday or Tuesday, to
          ensure delivery before the weekend. Shipping cost is $13.00 for up to
          3 plants, plus $1.00 for each additional plant. I do not ship to
          California or outside the United States.
        </p>
      </Space>

      <Image
        src={home3}
        placeholder="blur"
        alt="Rolling Oaks Daylilies Landscape"
      />

      <Space direction="column" block as="section">
        <Heading level={2}>Contact me?</Heading>
        <div ref={contactFormRef}>
          <ContactForm cta="Send me a message" action="/thanks" />
        </div>
      </Space>
      <br />
      <br />
      <br />
      <Space
        block
        css={`
          justify-content: flex-end;
        `}
      >
        <Link href="/catalogs">View Catalogs</Link>
        <Link href="/catalog/search">Search</Link>
      </Space>
    </Layout>
  );
};

export default Home;
