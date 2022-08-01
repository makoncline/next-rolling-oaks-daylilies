import React from "react";
import Layout from "../components/layout";
import { Alert, Heading } from "@packages/design-system";

const Page404: React.FC = () => {
  return (
    <Layout>
      <Alert type="danger">
        <Alert.Heading>
          <Heading level={1}>Uh-Oh!</Heading>
        </Alert.Heading>
        <Alert.Body>
          <p>This page does not exist!</p>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Page404;
