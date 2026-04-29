import React, { useState, useEffect } from 'react';

function useScrollPosition(): number {
  const [percent, setPercent] = useState(0);

  function handleScroll(): void {
    if (
      document.scrollingElement?.scrollHeight &&
      document.documentElement.clientHeight
    ) {
      const scrollTop =
        document.scrollingElement.scrollHeight -
        document.documentElement.clientHeight;
      const howFar = document.documentElement.scrollTop / scrollTop;
      setPercent(howFar);
    }
  }

  useEffect(() => {
    // listen for window scroll event
    document.addEventListener('scroll', handleScroll);
    return (): void => {
      document.removeEventListener('scroll', handleScroll);
    };
  });

  return percent;
}

const BackToTop: React.FC = () => {
  const percent = useScrollPosition();
  return (
    <a
      href="#top"
      title="Back To Top"
      className={`fixed bottom-[1%] right-[1%] hidden cursor-pointer rounded bg-black/50 p-4 text-white no-underline transition-opacity sm:block ${
        percent > 0.1 ? "opacity-100" : "opacity-0"
      }`}
    >
      &uarr;
    </a>
  );
};

export default BackToTop;
