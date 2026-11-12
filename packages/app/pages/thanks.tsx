import React from "react";
import Layout from "../components/layout";
import { Alert } from "components/ui";

const Thanks: React.FC = () => {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-136">
        <Alert type="success">
          <Alert.Heading>Thanks for Your Interest</Alert.Heading>
          <Alert.Body>
            <p>
              I’ll review your message and get back to you by email as soon as I
              can.
            </p>
          </Alert.Body>
        </Alert>
      </div>
    </Layout>
  );
};

export default Thanks;
