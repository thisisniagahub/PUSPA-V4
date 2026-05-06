import { pipeline } from "@xenova/transformers";

let embedderInstance: any = null;

export async function getEmbedder() {
  if (!embedderInstance) {
    embedderInstance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderInstance;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
