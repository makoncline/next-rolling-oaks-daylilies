import React, { useRef } from "react";
import Layout from "../components/layout";
import ContactForm from "../components/contactForm";
import type { NextPage } from "next";
import Image from "next/image";

import logoSquare from "../public/assets/logo.png";
import home1 from "../public/assets/home-1.jpeg";
import home2 from "../public/assets/home-2.jpg";
import home3 from "../public/assets/home-3.jpeg";
import { Button, Heading, Space } from "@packages/design-system";
import Link from "next/link";

const Home: NextPage = () => {
  const contactFormRef = useRef<HTMLDivElement>(null);
  return (
    <Layout>
      <Space responsive gap="large" center>
        <Image
          src={logoSquare}
          placeholder="blur"
          alt="Rolling Oaks Daylilies logo"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />

        <Space direction="column" as="section">
          <Heading level={1}>Rolling Oaks Daylilies</Heading>
          <span css={``}>
            Shop Our Stunning Collection of Named Daylilies and Seedlings.
          </span>
          <br />
          <p>
            Welcome to Rolling Oaks Daylilies, where you'll find a stunning
            collection of over 1000 named daylilies and unique seedlings. Our
            hybridizing focus is double and white daylilies, including a wide
            variety of forms like spiders and unusual doubles. As an AHS Display
            Garden, we pride ourselves on delivering the highest quality plants
            to our customers.
          </p>
          <Space direction="column" block>
            <Space responsive block>
              <Button
                styleType="primary"
                onClick={() => contactFormRef.current?.scrollIntoView()}
                block
              >
                Send me a message
              </Button>
              <Button
                as="a"
                href="https://goo.gl/maps/BKg722pc9e52"
                target="_blank"
                block
              >
                Get directions
              </Button>
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
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />

      <Space direction="column" block as="section">
        <Heading level={2}>Ordering</Heading>
        <Space direction="column" block>
          <p>
            To order, simply choose your favorite daylilies and checkout with a
            minimum order of $20.00. Our list prices are for double fans, which
            sometimes share one root system and may have small dormant plants.
            For availability, contact us at{" "}
            <a href="mailto:kaymcline@gmail.com">kaymcline@gmail.com</a> before
            payment or inquire about our "display only" plants. We accept checks
            made payable to Kay Cline, PayPal payments, and Venmo
            (@Karen-Cline-13).
          </p>
          <p>
            <strong>Please note</strong>, that while our mild southern climate
            is perfect for daylilies,{" "}
            <a href="https://www.daylilies.org/ahs_dictionary/daylily_rust.html">
              Daylily Rust
            </a>{" "}
            can overwinter, and we cannot guarantee rust-free plants.
          </p>
        </Space>
      </Space>

      <Image
        src={home2}
        placeholder="blur"
        alt="Rolling Oaks Daylilies Landscape"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />

      <Space direction="column" block as="section">
        <Heading level={2}>Shipping</Heading>
        <p>
          We ship Priority Mail (USPS) every Monday or Tuesday to ensure
          delivery before the weekend. Shipping costs $13.00 for up to 3 plants
          and $1.00 for each additional plant. Unfortunately, we do not ship to
          California or outside of the United States. Order now and experience
          the beauty of Rolling Oaks Daylilies in your own garden!
        </p>
      </Space>

      <Image
        src={home3}
        placeholder="blur"
        alt="Rolling Oaks Daylilies Landscape"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
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
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Space>
        <Link href="/list">listings</Link>
        <Link href="/blog">blog</Link>
      </Space>
    </Layout>
  );
};

export default Home;
