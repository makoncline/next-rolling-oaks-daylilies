import React from "react";
import Layout from "../components/layout";
import { Alert, Button } from "components/ui";

const Thanks: React.FC = () => {
  return (
    <Layout>
      <Alert type="success">
        <Alert.Heading>Thanks for Your Interest</Alert.Heading>
        <Alert.Body>
          <div className="flex flex-col items-start gap-4">
            <p>
              I’ll review your message and get back to you by email as soon as I
              can.
            </p>
            <p className="text-muted-foreground">
              If you asked about plants, I’ll confirm availability before
              payment. I accept checks, PayPal and Venmo.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button as="a" href="/catalogs" styleType="primary">
                View Catalogs
              </Button>
              <Button as="a" href="/">
                Back to Home
              </Button>
            </div>
          </div>
        </Alert.Body>
      </Alert>
    </Layout>
  );
};

export default Thanks;
