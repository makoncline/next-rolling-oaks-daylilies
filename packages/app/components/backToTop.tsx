import React from "react";

function useHasScrolledPastThreshold(): boolean {
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const scrollableHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (scrollableHeight <= 0) {
        setHasScrolled(false);
        return;
      }
      setHasScrolled(document.documentElement.scrollTop / scrollableHeight > 0.1);
    };

    const handleScroll = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    update();
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return hasScrolled;
}

const BackToTop: React.FC = () => {
  const hasScrolled = useHasScrolledPastThreshold();
  return (
    <a
      href="#main-content"
      aria-label="Back to Top"
      title="Back To Top"
      className={`fixed bottom-[1%] right-[1%] hidden cursor-pointer rounded bg-black/50 p-4 text-white no-underline transition-opacity sm:block ${
        hasScrolled
          ? "opacity-100"
          : "pointer-events-none invisible opacity-0"
      }`}
    >
      &uarr;
    </a>
  );
};

export default BackToTop;
