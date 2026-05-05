type Listener = (reduced: boolean) => void;

let cached = false;
let initialised = false;
const listeners = new Set<Listener>();

function init(): void {
  if (initialised) return;
  initialised = true;
  if (typeof window === 'undefined' || !window.matchMedia) return;

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  cached = mq.matches;
  mq.addEventListener('change', (event) => {
    cached = event.matches;
    for (const listener of listeners) listener(cached);
  });
}

export function prefersReducedMotion(): boolean {
  init();
  return cached;
}

export function onReduceMotionChange(listener: Listener): () => void {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
