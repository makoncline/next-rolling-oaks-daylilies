import Layout from "components/layout";
import Link from "next/link";

const Blog = () => {
  const posts = [
    {
      title: "Dorothy and Toto",
      slug: "dorothy-and-toto",
      description:
        '"Dorothy and Toto" is a stunning daylily that has won numerous awards, including the Stout Silver Medal, the highest award for a daylily. This semi-evergreen plant produces big, fluffy double blooms that are a beautiful mix of rose, peach, and cream. In this blog post, we\'ll explore the background history of this daylily, its characteristics, and its accolades. We\'ll also include some stunning photos of "Dorothy and Toto" from various gardens around the world.',
    },
  ];
  return (
    <Layout>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <p>{post.description}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Blog;
