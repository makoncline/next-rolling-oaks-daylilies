import type { NextPage } from "next";
import { PrismaClient } from "@prisma/client";
import markdownToHtml from "../lib/markdownToHtml";
import { Heading } from "@packages/design-system";
import type { users } from "@prisma/client";
import { siteConfig } from "../siteConfig";

const Home: NextPage<{ user: users; content: string | null }> = ({
  user,
  content,
}) => {
  return (
    <>
      <Heading level={1}>Rolling Oaks Daylilies</Heading>
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const prisma = new PrismaClient();
  const user = await prisma.users.findFirstOrThrow({
    where: { id: siteConfig.userId },
  });
  const content = user.bio ? await markdownToHtml(user.bio) : null;
  return {
    props: { user: JSON.parse(JSON.stringify(user)), content },
  };
}
