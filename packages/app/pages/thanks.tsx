import React from 'react';
import Layout from '../components/layout';
import Head from '../components/head';
import Container from '../components/container';
import { destroy } from '../utils/cart-localstorage';

const Header = () => (
  <Head
    title='Thanks for your interest!'
    description="I'll review your message and get back to you by email as soon as I can."
  />
);

const Thanks: React.FC = () => {
  const handleClear = () => {
    destroy();
  };
  handleClear();
  return (
    <Layout>
      <Container head={<Header />} />
    </Layout>
  );
};

export default Thanks;
