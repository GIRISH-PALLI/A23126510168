export function createLogger(scope = "ui") {
  const stamp = () => new Date().toISOString();

  return {
    info(message, data) {
      if (data === undefined) {
        console.log(`[${stamp()}] [${scope}] ${message}`);
        return;
      }
      console.log(`[${stamp()}] [${scope}] ${message}`, data);
    },
    error(message, data) {
      if (data === undefined) {
        console.error(`[${stamp()}] [${scope}] ${message}`);
        return;
      }
      console.error(`[${stamp()}] [${scope}] ${message}`, data);
    }
  };
}
