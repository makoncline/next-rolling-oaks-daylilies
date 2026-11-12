import React from "react";
import { ChevronUp } from "lucide-react";

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
      className={`fixed bottom-4 right-4 hidden cursor-pointer rounded-full border-stroke border-card-border bg-popover p-2.5 text-popover-foreground shadow-toast transition-opacity hover:bg-secondary-hover sm:block ${
        hasScrolled
          ? "opacity-100"
          : "pointer-events-none invisible opacity-0"
      }`}
    >
      <ChevronUp aria-hidden="true" className="shrink-0 size-5" />
    </a>
  );
};

export default BackToTop;
