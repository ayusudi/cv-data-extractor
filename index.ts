import dotenv from "dotenv";
// run dotenv.config() if in development stage
if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

import fs from "fs";
import {
  DocumentProcessor,
  ClaudeProcessor,
  type CvData,
  type Experience,
  type Education,
  type Language,
  ContractType,
  LanguageLevel,
} from "@racsodev/cv-pdf-to-json";

// Initialize Claude AI processor with native PDF support
const processor = new ClaudeProcessor({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Create document processor
const documentProcessor = new DocumentProcessor({
  processor,
  outputJsonPath: "./outputs",
  debug: true,
});

let data: CvData[] = [];

// Process CV
async function processCV(pdfPath: string) {
  const result = await documentProcessor.process(pdfPath);
  if (result.success && result.data) {
    const cvData: CvData = result.data;
    console.log("Extracted CV Data:", cvData);
    data.push(cvData);
  }

  // Adding a 60-seconds delay
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000));

  return result;
}

// loop list file in /data folder
async function processAllCV() {
  try {
    const files = fs.readdirSync("data");
    for (const file of files) {
      try {
        await processCV(`data/${file}`);
      } catch (err) {
        console.log("Error processing file:", file, err);
      }
    }
    fs.writeFileSync("compileCV.json", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Unable to scan directory:", err);
  }
}

processAllCV();
