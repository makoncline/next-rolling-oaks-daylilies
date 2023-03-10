import Layout from "components/layout";
import Image from "next/image";

const Blog = () => {
  return (
    <Layout>
      <h1>Dorothy and Toto</h1>
      <article>
        <h2>Introduction</h2>
        <p>
          Dorothy and Toto is a stunning daylily that was introduced in 2003 by
          Herrington-K. It has won several awards, including the Stout Silver
          Medal in 2015, and is highly regarded by daylily enthusiasts.
        </p>

        <h2>Description</h2>
        <p>
          Dorothy and Toto is a semi-evergreen daylily that blooms in mid-season
          and reblooms. It grows up to 30 inches tall and has 22 buds on 5
          branches. The 6-inch double blooms are fragrant and a mix of rose,
          peach, and cream. The green throat of the flower provides an excellent
          contrast to the blooms' colors.
        </p>
        <figure>
          <Image
            src="https://garden.org/pics/2022-02-23/floota/4f618a-250.jpg"
            alt="Dorothy and Toto daylily"
            width={250}
            height={250}
            unoptimized
          />
          <figcaption>
            A beautiful photo of the Dorothy and Toto daylily.
          </figcaption>
        </figure>

        <h2>Background History</h2>
        <p>
          Dorothy and Toto is a hybrid of Night Embers and (Victoria's Secret X
          sdlg). It has earned several awards from the American Hemerocallis
          Society, including the Stout Silver Medal in 2015, the Award of Merit
          in 2012, and the Honorable Mention in 2009.
        </p>

        <h2>Photos</h2>
        <p>Here are some stunning photos of the Dorothy and Toto daylily:</p>
        <figure>
          <Image
            src="https://garden.org/pics/2019-04-24/hillbilly/bbc769-250.jpg"
            alt="Dorothy and Toto daylily"
            width={250}
            height={250}
            unoptimized
          />
          <figcaption>
            A photo of the Dorothy and Toto daylily with other daylilies in the
            background.
          </figcaption>
        </figure>
        <figure>
          <Image
            src="https://garden.org/pics/2022-02-23/floota/2c5764-250.jpg"
            alt="Dorothy and Toto daylily"
            width={250}
            height={250}
            unoptimized
          />
          <figcaption>
            A close-up of the beautiful blooms of the Dorothy and Toto daylily.
          </figcaption>
        </figure>
        <h2>Conclusion</h2>
        <p>
          The Dorothy and Toto daylily is a must-have for any daylily
          enthusiast. Its beautiful blooms, pleasant fragrance, and multiple
          awards make it an excellent addition to any garden. If you're looking
          for a daylily that is both beautiful and easy to care for, you can't
          go wrong with Dorothy and Toto.
        </p>
      </article>
    </Layout>
  );
};

export default Blog;
