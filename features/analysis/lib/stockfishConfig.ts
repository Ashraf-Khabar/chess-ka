/**
 * Shared UCI bootstrap for Stockfish WASM workers.
 * Hash + Threads improve search quality vs bare defaults.
 */
export function configureStockfishWorker(worker: Worker): void {
  const threads =
    typeof navigator !== "undefined"
      ? Math.min(4, Math.max(1, navigator.hardwareConcurrency || 2))
      : 2;

  worker.postMessage("uci");
  worker.postMessage("setoption name Hash value 128");
  worker.postMessage(`setoption name Threads value ${threads}`);
  worker.postMessage("isready");
}
