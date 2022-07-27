import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import s3ImgData from '../data/s3ImgData';

const ImgDatePage = () => {
  const data = useStaticQuery(graphql`
    query {
      postgres {
        userById(id: 3) {
          liliesByUserId {
            nodes {
              name
              imgUrl
            }
          }
        }
      }
    }
  `);

  type LilyProps = {
    name: string;
    imgUrl: string[];
  };

  const lilies: LilyProps[] = data.postgres.userById.liliesByUserId.nodes;

  const s3ImgDataArray: {
    Key: string;
    LastModified: string;
    ETag: string;
    Size: number;
    StorageClass: string;
  }[] = s3ImgData.Contents;

  const getImgDate: (
    key: string,
  ) => { key: string; lastMod: string } | null = key => {
    if (!s3ImgDataArray) return null;

    const s3Data = s3ImgDataArray.find(item => {
      return item.Key.substring(2) === key;
    });
    if (!s3Data) return null;
    const out = { key: s3Data.Key, lastMod: s3Data.LastModified };
    return out;
  };

  const parseImgKey: (url: string) => string | null = url => {
    if (url.includes('www.daylilies.org')) return null;
    if (!url.includes('https://daylily-catalog-images.s3.amazonaws.com/3'))
      return null;

    const key = url.split('/').pop();
    return key || null;
  };

  const getLilyImgsDates: (
    lily: LilyProps,
  ) => {
    name: string;
    imgUrls: {
      url: string;
      lastMod: string;
    }[];
  } | null = lily => {
    const imgs = lily.imgUrl;
    if (!imgs.length) return null;
    const imgsAndDates: {
      url: string;
      lastMod: string;
    }[] = [];
    imgs.forEach(img => {
      const key = parseImgKey(img);
      if (!key) return null;
      const date = getImgDate(key);
      if (!date) return null;
      const imgAndDate = {
        url: img,
        lastMod: date.lastMod,
      };
      imgsAndDates.push(imgAndDate);
    });
    if (!imgsAndDates.length) return null;
    const out = { name: lily.name, imgUrls: imgsAndDates };
    return out;
  };

  const imgDateLilies = lilies
    .map(lily => getLilyImgsDates(lily))
    .filter(Boolean);

  return (
    <div>
      <script src='https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js'></script>
      <pre className='prettyprint'>
        {imgDateLilies &&
          imgDateLilies.map(item => JSON.stringify(item, null, 4))}
      </pre>
    </div>
  );
};

export default ImgDatePage;
