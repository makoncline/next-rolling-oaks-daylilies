import React from 'react';
import Layout from '../components/layout';
import Container from '../components/container';
import Head from '../components/head';

const Header = () => (
  <Head title='Uh-Oh!' description='This page does not exist!' />
);

const Page404: React.FC = () => {
  return (
    <Layout>
      <Container head={<Header />} />
    </Layout>
  );
};

export default Page404;
