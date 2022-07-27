import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { Catalog } from "../pages/catalogs";

type CatalogCardProps = {
  catalog: Catalog;
};

const CatalogCard: React.FC<CatalogCardProps> = ({ catalog }) => {
  const { imgUrls, intro, name, slug, totalCount } = catalog;

  const image = imgUrls && imgUrls[Math.floor(Math.random() * imgUrls.length)];
  return (
    <Style image={image || null}>
      <div className="container">
        <div style={{ position: "relative", width: 250, height: 250 }}>
          {image ? (
            <Image
              src={image}
              layout="fill"
              alt={catalog.name + "image"}
              className="image"
              objectFit="cover"
            />
          ) : (
            <div className="image" />
          )}
        </div>
        <div className="text">
          <h2>{catalog.name}</h2>
          {catalog.intro && <p>{catalog.intro}</p>}
          {totalCount && <p>{`${totalCount.toLocaleString()} listings`}</p>}
          <Link href={`/${slug}`} id={`link-${slug}`}>
            View catalog
          </Link>
        </div>
      </div>
    </Style>
  );
};

export default CatalogCard;

type StyleProps = {
  image: string | null;
};
const Style = styled.div<StyleProps>`
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  &:hover {
    background-color: var(--bg-shine);
  }
  .container {
    display: grid;
    grid-template-columns: 250px 1fr;
    align-items: center;
    margin: 1rem;
    @media (max-width: 700px) {
      grid-template-columns: auto;
      justify-content: stretch;
      justify-items: center;
    }
  }
  .image {
    width: 250px;
    height: 250px;
    background: var(--bg-2);
    ${(props) =>
      props.image &&
      `
      background-image: url("${props.image}");
      `}
  }
  .text {
    margin: 0 1rem;
    width: 100%;
  }
`;
