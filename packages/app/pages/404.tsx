import React from "react";
import Layout from "../components/layout";
import { Alert } from "components/ui";

const Page404: React.FC = () => {
  return (
    <Layout>
      <Alert type="danger">
        <Alert.Heading>Page Not Found</Alert.Heading>
        <Alert.Body>
          <p>This page does not exist.</p>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Page404;
