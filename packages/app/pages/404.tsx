import React from "react";
import Layout from "../components/layout";
import { Alert, Button } from "components/ui";

const Page404: React.FC = () => {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-136">
        <Alert type="danger">
          <Alert.Heading>Page Not Found</Alert.Heading>
          <Alert.Body>
            <p>This page does not exist.</p>
            <div className="mt-4 flex max-w-full flex-wrap gap-4">
              <Button as="a" href="/catalog/search" styleType="primary">
                Search Catalog
              </Button>
              <Button as="a" href="/catalogs">
                View Catalogs
              </Button>
            </div>
          </Alert.Body>
        </Alert>
      </div>
    </Layout>
  );
};

export default Page404;
