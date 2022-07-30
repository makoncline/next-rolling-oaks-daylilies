import React, { useRef } from "react";
import styled from "styled-components";
import Layout from "../components/layout";
import Button from "../components/button";
import ContactForm from "../components/contactForm";
import type { NextPage } from "next";
import Image from "next/image";
import logoSquare from "../public/assets/logo-square.png";
import home1 from "../public/assets/home-1.jpeg";
import home2 from "../public/assets/home-2.jpg";
import home3 from "../public/assets/home-3.jpeg";

const Home: NextPage = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  return (
    <Layout>
      <Style>
        <div className="hero">
          <div className="hero-buttons">
            <Button
              look="secondary"
              onClick={() => emailRef.current && emailRef.current.focus()}
              fullWidth
              label="message"
            >
              Send me a message
            </Button>
            <form action="tel:6015901349" target="_blank" className="form">
              <Button type="submit" look="secondary" fullWidth label="call">
                Give me a call
              </Button>
            </form>
            <form
              action="https://goo.gl/maps/BKg722pc9e52"
              target="_blank"
              className="form"
            >
              <Button
                type="submit"
                look="secondary"
                fullWidth
                label="directions"
              >
                Get directions
              </Button>
            </form>
          </div>
          <div className="hero-image">
            <Image src={logoSquare} alt="Rolling Oaks Daylilies logo" />
          </div>
          <div className="hero-text">
            <h1>Welcome to Rolling Oaks Daylilies</h1>
            <p className="text--mid">
              I grow approximately 1000 named daylilies and a few thousand of my
              own seedlings. My collection includes a wide variety of forms,
              including spiders, unusual forms, and doubles. My current
              hybridizing focus is double and white daylilies. I have been an
              AHS Display Garden for several years.
            </p>
          </div>
        </div>
        <div className="content">
          <div className="home-image">
            <Image src={home1} alt="Rolling Oaks Daylilies Landscape" />
          </div>
          <div>
            <h2>Ordering</h2>
            {/*eslint-disable */}
            <p>
              Minimum order is $20.00. The list price is for a double fan. A
              double fan can sometimes share one root system and dormant plants
              can be small here. Shipped bare root. Please send me a message, or
              email me to check availability prior to payment at{" "}
              <a href="mailto:kaymcline@gmail.com">kaymcline@gmail.com</a>.
              Sometimes, I may be able to sell a daylily that is listed as
              “display only" (list will not show a price or shopping cart
              button). I accept checks made payable to Kay Cline or Paypal
              payment to kaymcline@gmail.com and can send a PayPal Invoice if
              you want. I also accept Venmo (@Karen-Cline-13).
            </p>
            {/*eslint-enable */}
            <p>
              <strong>Please note</strong>,{" "}
              <a href="https://www.daylilies.org/ahs_dictionary/daylily_rust.html">
                Daylily Rust
              </a>{" "}
              can overwinter in our mild southern climate. I cannot gaurantee
              rust-free plants.
            </p>
          </div>
          <div className="home-image">
            <Image src={home2} alt="Rolling Oaks Daylilies Landscape" />
          </div>
          <div>
            <h2>Shipping</h2>
            <p>
              I ship Priority Mail (USPS) the same day I dig, Monday or Tuesday,
              to ensure delivery before the weekend. Shipping cost is $13.00 for
              up to 3 plants, plus $1.00 for each additional plant. I do not
              ship to California or outside the United States.
            </p>
          </div>
          <div className="home-image">
            <Image src={home3} alt="Rolling Oaks Daylilies Landscape" />
          </div>
          <div className="contactForm" id="contact">
            <h2>Contact me?</h2>
            <ContactForm
              cta="Send me a message"
              forwardRef={emailRef}
              action="/thanks"
            />
          </div>
        </div>
      </Style>
    </Layout>
  );
};

export default Home;

const Style = styled.div`
  .form {
    width: 100%;
  }
  .hero {
    display: grid;
    grid-template-columns: 40% 60%;
    align-items: center;
    margin-top: 1rem;
    @media (max-width: 768px) {
      display: flex;
      flex-direction: column-reverse;
    }
  }
  .hero-image {
    width: calc(100% - 2rem);
    max-width: 400px;
    height: auto;
    margin: 0 1rem;
  }
  .hero-text {
    margin: 0 1rem;
    max-width: 35rem;
  }
  .hero-buttons {
    grid-area: 2/1/3/3;
    display: flex;
    justify-content: space-evenly;
    margin-top: 3rem;
    @media (max-width: 768px) {
      flex-direction: column;
      margin-top: 2rem;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: auto 1rem;
    & > div {
      width: 100%;
      max-width: 35rem;
      margin: 3rem 1rem 0 1rem;
    }
  }
`;
