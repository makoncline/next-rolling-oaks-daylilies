import Layout from "components/layout";
import Link from "next/link";
import Image from "next/image";

const Blog = () => {
  const posts = [
    {
      title: "Dorothy and Toto",
      slug: "dorothy-and-toto",
      description:
        "“Dorothy and Toto” is a stunning daylily that has won numerous awards, including the Stout Silver Medal, the highest award for a daylily. This semi-evergreen plant produces big, fluffy double blooms that are a beautiful mix of rose, peach, and cream. In this blog post, we’ll explore the background history of this daylily, its characteristics, and its accolades. We’ll also include some stunning photos of “Dorothy and Toto” from various gardens around the world.",
    },
  ];
  return (
    <Layout>
      <h1 className="m-0">Blog</h1>
      <ul className="m-0 grid max-w-prose list-none gap-6 p-0">
        {posts.map((post) => (
          <li
            className="relative"
            key={post.slug}
          >
            <div className="grid gap-4 sm:grid-cols-media sm:gap-6">
              <Image
                src="https://garden.org/pics/2022-02-23/floota/4f618a-250.jpg"
                alt=""
                aria-hidden="true"
                className="aspect-4/3 w-full rounded-md object-cover sm:aspect-square sm:w-44"
                width={250}
                height={250}
                priority
                unoptimized
              />
            <div className="flex flex-col gap-2">
              <h2 className="m-0 text-heading-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-foreground-emphasis no-underline after:absolute after:inset-0 hover:text-primary-hover hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="m-0 text-muted-foreground">{post.description}</p>
            </div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Blog;
