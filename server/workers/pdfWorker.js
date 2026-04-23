import { parentPort, workerData } from "worker_threads";
import generatePDF from "../utils/generatePDF.js";

async function startWorker() {
  try {
    const { report } = workerData;
    const pdfBuffer = await generatePDF(report);

    parentPort.postMessage({ success: true, buffer: pdfBuffer });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
}

startWorker();
