export interface TrainingOptions {
  epochs: number;
  batchSize: number;
  learningRate?: number;
  validationSplit?: number;
}

export interface ModelConfig {
  latentDim: number;
  inputShape: [number, number, number, number]; // [x, y, z, channels]
  encoderLayers: number[];
  decoderLayers: number[];
}

export interface TrainingData {
  bases: number[][][][]; // 4D tensor [batch, x, y, z]
  scores: number[];       // Overall scores for each base
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  latentDim: 128,
  inputShape: [32, 32, 16, 8], // 32x32x16 grid, 8 channels (piece types + materials)
  encoderLayers: [64, 128, 256],
  decoderLayers: [256, 128, 64],
};
