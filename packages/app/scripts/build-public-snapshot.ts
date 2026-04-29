import { refreshPublicSnapshot } from "../lib/publicSnapshot";

refreshPublicSnapshot()
  .then((snapshot) => {
    console.log(
      `Built public snapshot ${snapshot.version} with ${snapshot.counts.visibleListings} visible listings.`
    );
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
