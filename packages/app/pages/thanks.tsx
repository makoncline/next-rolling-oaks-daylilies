import React from "react";
import Layout from "../components/layout";
import { Alert, Heading } from "@packages/design-system";

const Thanks: React.FC = () => {
  return (
    <Layout>
      <Alert type="success">
        <Alert.Heading>
          <Heading level={1}>Thanks for your interest!</Heading>
        </Alert.Heading>
        <Alert.Body>
          <p>
            I{`'`}ll review your message and get back to you by email as soon as
            I can.
          </p>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Thanks;
