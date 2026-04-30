import React from "react";
import Layout from "../components/layout";
import { Alert, Button, Space } from "components/ui";

const Page404: React.FC = () => {
  return (
    <Layout>
      <Alert type="danger" className="mx-auto">
        <Alert.Heading>Page Not Found</Alert.Heading>
        <Alert.Body>
          <p>This page does not exist.</p>
          <Space className="mt-4 flex-wrap">
            <Button as="a" href="/catalog/search" styleType="primary">
              Search Catalog
            </Button>
            <Button as="a" href="/catalogs">
              View Catalogs
            </Button>
          </Space>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Page404;
