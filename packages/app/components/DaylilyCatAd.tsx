import React from "react";
import { Alert, Button } from "components/ui";

export const DaylilyCatalogAd = () => {
  return (
    <div className="mt-12 flex w-full justify-center">
      <Alert type="success">
        <Alert.Heading level={2}>Build Your Own Daylily Website</Alert.Heading>
        <p>
          With DaylilyCatalog.com, you can build your own daylily website and
          share your flowers with the world. With our easy-to-use tools, you can
          add your daylily listings, upload photos, make lists, and have access
          to data and photos of 90,000+ registered daylilies with just a few
          clicks.
        </p>
        <Button
          as="a"
          href="https://daylilycatalog.com"
          styleType="primary"
          block
        >
          Get Started for Free
        </Button>
      </Alert>
    </div>
  );
};
