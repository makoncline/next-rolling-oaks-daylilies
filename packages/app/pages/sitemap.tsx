const Sitemap = () => null;

export const getServerSideProps = async () => ({
  redirect: {
    destination: "/404",
    permanent: false,
  },
});

export default Sitemap;
