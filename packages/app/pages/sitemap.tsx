const Sitemap = () => null;

export const getServerSideProps = async () => ({
  redirect: {
    destination: "/api/sitemap",
    permanent: false,
  },
});

export default Sitemap;
