import { useEffect, useRef } from 'react';

/**
 * Custom hook that monitors user inactivity and triggers a callback
 * after the specified timeout duration.
 *
 * @param {Function} onIdle - Callback to execute when the user is idle
 * @param {number} timeoutMs - Inactivity threshold in milliseconds
 * @param {boolean} enabled - Whether the idle timer is active
 */
export default function useIdleTimer(onIdle, timeoutMs = 30 * 60 * 1000, enabled = false) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Keep the callback ref up to date without re-attaching listeners
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onIdleRef.current();
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Start the initial timer
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [timeoutMs, enabled]);
}
