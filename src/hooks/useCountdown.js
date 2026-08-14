import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef(null);

  const start = useCallback((secs) => {
    setSeconds(secs);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer.current);
          timer.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timer.current), []);

  return { seconds, active: seconds > 0, start };
}
