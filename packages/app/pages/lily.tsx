import React, { useContext } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import Helmet from 'react-helmet';
import cart from '@iconify/icons-ic/round-shopping-cart';
import ImgCarousel from '../components/imgCarousel';
import Head from '../components/head';
import Container from '../components/container';
import Layout from '../components/layout';
import { add } from '../utils/cart-localstorage';
import { store } from '../components/store';
import useSnackBars from '../hooks/useSnackBar';
import { DaylilyCatAd } from '../components/DaylilyCatAd';

import { LilyType } from '../types/types';

const traitLabels = {
  hybridizer: 'Hybridizer',
  year: 'Year',
  parentage: 'Parentage',
  ploidy: 'Ploidy',
  scapeHeight: 'Scape height',
  color: 'Color',
  bloomHabit: 'Bloom habit',
  bloomSeason: 'Bloom season',
  bloomSize: 'Bloom size',
  branches: 'Branches',
  budcount: 'Bud count',
  flower: 'Flower',
  foliage: 'Foliage',
  foliageType: 'Foliage type',
  form: 'Form',
  fragrance: 'Fragrance',
  sculpting: 'Sculpting',
  seedlingNum: 'Seedling #',
};

enum ahsProps {
  hybridizer = 'hybridizer',
  year = 'year',
  parentage = 'parentage',
  color = 'color',
  ploidy = 'ploidy',
  bloomSeason = 'bloomSeason',
  bloomHabit = 'bloomHabit',
  budcount = 'budcount',
  branches = 'branches',
  bloomSize = 'bloomSize',
  scapeHeight = 'scapeHeight',
  foliageType = 'foliageType',
  seedlingNum = 'seedlingNum',
  fragrance = 'fragrance',
  form = 'form',
  foliage = 'foliage',
  flower = 'flower',
  sculpting = 'sculpting',
}

const Header: React.FC<{ title: string }> = ({ title }: { title: string }) => (
  <Head title={title} />
);

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

const Lily: React.FC<{ lily: LilyType }> = ({ lily }: { lily: LilyType }) => {
  const cartItem = lily.price && {
    id: lily.id,
    name: lily.name,
    price: lily.price,
  };
  const { dispatch } = useContext(store);
  const addAlert = useSnackBars()?.addAlert;
  let images = lily?.localImgUrls
    ?.map(node => {
      if (node?.childImageSharp) {
        return node.childImageSharp.fixed;
      }
    })
    .filter(Boolean)
    .reverse();
  if (images.length < 1 && lily?.imgUrl && lily?.imgUrl.length > 0) {
    images = lily.imgUrl.reverse();
  }
  if (images.length < 1 && lily.ahsDatumByAhsRef?.image) {
    images = [lily.ahsDatumByAhsRef?.image];
  }

  return (
    <Style>
      <div className='content'>
        <div className='left'>
          {images && images.length > 0 && (
            <div className='img'>
              <ImgCarousel images={images} />
            </div>
          )}
          {cartItem && (
            <button
              type='button'
              aria-label='add to cart'
              className='cart'
              onClick={() => {
                add(cartItem);
                addAlert && addAlert(`Added ${lily.name} to cart!`);
                dispatch({ type: 'update cart' });
              }}
            >
              <Icon className='icon' icon={cart} />
            </button>
          )}
        </div>
        <div className='right'>
          {lily.publicNote && (
            <p>
              Note:
              <br /> {lily.publicNote}
            </p>
          )}
          <table>
            <tbody>
              {lily.ahsDatumByAhsRef &&
                Object.keys(traitLabels).map(trait => {
                  if (
                    lily.ahsDatumByAhsRef &&
                    getKeyValue(lily.ahsDatumByAhsRef, trait as ahsProps)
                  ) {
                    return (
                      <tr key={trait}>
                        <td className='label'>
                          {getKeyValue(traitLabels, trait as ahsProps)} :
                        </td>
                        <td className='value'>
                          {getKeyValue(
                            lily.ahsDatumByAhsRef,
                            trait as ahsProps,
                          )}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
            </tbody>
          </table>
        </div>
      </div>
    </Style>
  );
};

const Footer = () => <Bottom></Bottom>;

const Bottom = styled.div`
  padding: 1rem;
  background-color: var(--bg-3);
  border-radius: 0 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  button {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: 1px solid rgb(var(--rgb-blue));
    outline: none;
    color: rgb(var(--rgb-blue));
    border-radius: 3rem;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    span {
      margin-left: 0.5rem;
    }
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
    }
  }
`;

const LilyTemplate: React.FC<{
  pageContext: { lily: LilyType; previous: string; next: string };
}> = ({
  pageContext,
}: {
  pageContext: { lily: LilyType; previous: string; next: string };
}) => {
  const { lily } = pageContext;
  const description = `${
    (lily.publicNote ? `Description: ${lily.publicNote.trim()}` : '') +
    (lily.price ? `, Price: ${lily.price}` : ', Price: Display only') +
    Object.keys(traitLabels)
      .map(trait => {
        if (
          lily.ahsDatumByAhsRef &&
          getKeyValue(lily.ahsDatumByAhsRef, trait as ahsProps)
        ) {
          return `${getKeyValue(traitLabels, trait as ahsProps)}: ${getKeyValue(
            lily.ahsDatumByAhsRef,
            trait as ahsProps,
          )}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ')
  }, Updated: ${formatDistanceToNow(new Date(lily.updatedAt), {
    addSuffix: true,
  })}`;
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : '';
  const images = [...lily?.localImgUrls, lily.ahsDatumByAhsRef?.image]
    ?.map(node => {
      if (node?.childImageSharp) {
        return `${baseUrl}${node.childImageSharp.fixed.src}`;
      }
    })
    .filter(Boolean);
  const image = images.length > 0 ? images[0] : '';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = `${lily.name} Daylily`;
  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta property='og:title' content={title} />
        <meta name='description' content={description} />
        <meta property='og:description' content={description} />
        <meta property='og:type' content='article' />
        <meta property='og:image' content={image} />
        <meta name='og:image:alt' content={`${title} image`} />
        <meta property='og:url' content={url} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:image:alt' content={`${title} image`} />
      </Helmet>
      <Style>
        <Container
          head={<Header title={lily.name} />}
          content={<Lily lily={lily} />}
          foot={<Footer />}
        />
        <DaylilyCatAd />
      </Style>
    </Layout>
  );
};

export default LilyTemplate;

const Style = styled.div`
  .cart {
    display: block;
    margin: auto;
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    border-radius: 3rem;
    font-size: 1.5rem;

    height: 40px;
    color: rgb(var(--rgb-blue));
    transition: transform 0.3s, color 1s;
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      outline: none;
      color: rgb(var(--rgb-green));
      transition: none;
    }
    .icon {
      display: block;
      margin: auto;
    }
  }
  .content {
    padding: 0;
    background-color: var(--bg-4);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    table {
      border-collapse: collapse;
      td {
        vertical-align: top;
        padding: 0.2rem 0 0.2rem 0;
      }
      tr:nth-child(even) {
        background-color: var(--bg-2);
      }
      .label {
        text-align: right;
        width: 7rem;
      }
      .value {
        padding-left: 1rem;
      }
    }
    .img {
      width: 100%;
      min-width: 250px;
      max-width: 400px;
      margin: 1rem;
      display: block;
      margin: auto;
    }
    @media (max-width: 768px) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
  }
  .left {
    flex: 1;
    width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .right {
    flex: 1;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`;
