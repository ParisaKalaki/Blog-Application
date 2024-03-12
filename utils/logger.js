export function logger() {
  const info = (...params) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(...params);
    }
  };

  const error = (...params) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(...params);
    }
  };
  return { info, error };
}
