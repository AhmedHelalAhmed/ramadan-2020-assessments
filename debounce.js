export function debounce(fn, time) {
  // delay then do action
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    // apply to apply current context
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}
