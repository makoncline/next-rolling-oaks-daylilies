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
      <h1>Blog</h1>
      <ul className="grid list-none gap-6 p-0">
        {posts.map((post) => (
          <li className="border-b border-ro-muted pb-6" key={post.slug}>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <Image
                src="https://garden.org/pics/2022-02-23/floota/4f618a-250.jpg"
                alt=""
                aria-hidden="true"
                className="aspect-[4/3] w-full object-cover sm:aspect-square"
                width={250}
                height={250}
                priority
                unoptimized
              />
            <div>
              <h2 className="mt-0 text-2xl">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
            </div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Blog;
