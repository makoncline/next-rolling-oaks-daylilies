import React from "react";
import Layout from "../components/layout";
import { Alert } from "@packages/design-system";
import { useCart } from "components/cart";

const Thanks: React.FC = () => {
  const { clear } = useCart();
  React.useEffect(() => {
    clear();
  }, []);
  return (
    <Layout>
      <Alert type="success">
        <Alert.Heading>Thanks for your interest!</Alert.Heading>
        <Alert.Body>
          <p>
            I'll review your message and get back to you by email as soon as I
            can.
          </p>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Thanks;
