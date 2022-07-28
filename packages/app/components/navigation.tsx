import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import logoSquare from "../public/assets/logo-square.png";
import { darkTheme } from "../styles/theme";
import { useCart } from "./cart";

const Navigation = () => {
  const { numItems } = useCart();

  return (
    <Style>
      <div className="left">
        <div className="logo">
          <Link href="/" aria-label="return home">
            <a>
              <Image
                src={logoSquare}
                width={64}
                height={64}
                alt="Rolling Oaks Daylilies logo"
              />
            </a>
          </Link>
        </div>
        <Link href="/catalogs" className="nav">
          Catalogs
        </Link>
        <Link href="/catalog/search" className="nav">
          Search
        </Link>
        <Link href="/cart" className="nav">
          {`Cart ${numItems > 0 ? ` (${numItems})` : ""}`}
        </Link>
      </div>
    </Style>
  );
};

export default Navigation;

const Style = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: -webkit-sticky; /* Safari */
  position: sticky;
  background-color: ${darkTheme["bg-5"]};
  z-index: 100;

  top: 0;
  .logo {
    margin-left: 1rem;
    span {
      margin: 0;
    }
    @media (max-width: 500px) {
      margin-left: 5px;
    }
  }
  .title {
    h4 {
      margin: 0 0.5rem 0 0;
    }
    display: flex;
    justify-content: center;
    align-items: baseline;
  }
  .dark-toggle {
    margin-right: 1rem;
    right: 0;
    align-self: center;
    @media (max-width: 500px) {
      margin-right: 5px;
    }
  }
  .left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
  }
  a,
  .nav {
    text-decoration: none;
    color: var(--text-high);
    &:visited {
      color: var(--text-high);
    }
    &:hover {
      color: rgb(var(--rgb-blue));
    }
  }
  .active {
    text-decoration: underline;
    color: rgb(var(--rgb-purple));
  }
`;
