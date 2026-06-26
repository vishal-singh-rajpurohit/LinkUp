import { useEffect, useState } from "react";

export const useLoadScript = (src: string) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already present
    if (document.querySelector(`script[src="${src}"]`)) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error(`Failed to load script: ${src}`);

    document.body.appendChild(script);

    return () => {
      // optional: do not remove if you want to reuse across app
    };
  }, [src]);

  return loaded;
};
