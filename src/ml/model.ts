import { ModelConfig, DEFAULT_MODEL_CONFIG } from './types.js';

// Dynamic TensorFlow import
let tf: any = null;
async function getTF() {
  if (!tf) {
    try {
      tf = await import('@tensorflow/tfjs-node');
    } catch (err) {
      throw new Error('TensorFlow.js not available. Install with: npm install @tensorflow/tfjs-node');
    }
  }
  return tf;
}

/**
 * VAE (Variational Autoencoder) Model for base generation
 * Learns latent representation of good base designs
 */
export class BaseGeneratorModel {
  private encoder?: any;
  private decoder?: any;
  private config: ModelConfig;

  constructor(config: ModelConfig = DEFAULT_MODEL_CONFIG) {
    this.config = config;
  }

  /**
   * Build the encoder network
   */
  async buildEncoder(): Promise<any> {
    const tf = await getTF();
    const [x, y, z, channels] = this.config.inputShape;
    const input = tf.input({ shape: [x, y, z, channels] });
    
    let features = input;
    
    // Encoder layers with 3D convolutions
    for (const filters of this.config.encoderLayers) {
      features = tf.layers.conv3d({
        filters,
        kernelSize: 3,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      }).apply(features) as any;
      
      features = tf.layers.batchNormalization().apply(features) as any;
    }
    
    // Flatten and create latent representation
    features = tf.layers.flatten().apply(features) as any;
    
    // Mean and log variance for VAE
    const zMean = tf.layers.dense({
      units: this.config.latentDim,
      name: 'z_mean',
    }).apply(features) as any;
    
    const zLogVar = tf.layers.dense({
      units: this.config.latentDim,
      name: 'z_log_var',
    }).apply(features) as any;
    
    this.encoder = tf.model({
      inputs: input,
      outputs: [zMean, zLogVar],
      name: 'encoder',
    });
    
    return this.encoder;
  }

  /**
   * Build the decoder network
   */
  async buildDecoder(): Promise<any> {
    const tf = await getTF();
    const [x, y, z, channels] = this.config.inputShape;
    const latentInput = tf.input({ shape: [this.config.latentDim] });
    
    // Calculate dimensions after encoding
    const dimX = Math.ceil(x / Math.pow(2, this.config.encoderLayers.length));
    const dimY = Math.ceil(y / Math.pow(2, this.config.encoderLayers.length));
    const dimZ = Math.ceil(z / Math.pow(2, this.config.encoderLayers.length));
    const lastFilters = this.config.encoderLayers[this.config.encoderLayers.length - 1];
    
    // Dense layer to reshape
    let features = tf.layers.dense({
      units: dimX * dimY * dimZ * lastFilters,
      activation: 'relu',
    }).apply(latentInput) as any;
    
    features = tf.layers.reshape({
      targetShape: [dimX, dimY, dimZ, lastFilters],
    }).apply(features) as any;
    
    // Decoder layers with 3D transposed convolutions
    for (const filters of this.config.decoderLayers) {
      features = tf.layers.conv3dTranspose({
        filters,
        kernelSize: 3,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      }).apply(features) as any;
      
      features = tf.layers.batchNormalization().apply(features) as any;
    }
    
    // Final layer to output
    const output = tf.layers.conv3d({
      filters: channels,
      kernelSize: 3,
      padding: 'same',
      activation: 'sigmoid',
    }).apply(features) as any;
    
    this.decoder = tf.model({
      inputs: latentInput,
      outputs: output,
      name: 'decoder',
    });
    
    return this.decoder;
  }

  /**
   * Generate a new base from random latent vector
   */
  async generate(seed?: number): Promise<number[][][][]> {
    const tf = await getTF();
    
    if (!this.decoder) {
      throw new Error('Decoder not built. Call buildDecoder() first.');
    }
    
    // Sample from latent space
    const latent = tf.randomNormal([1, this.config.latentDim], 0, 1, 'float32', seed);
    
    // Generate
    const generated = this.decoder.predict(latent) as any;
    const result = await generated.array();
    
    latent.dispose();
    generated.dispose();
    
    // Result is [batch, x, y, z, channels], return first item
    return (result as number[][][][][])[0];
  }

  /**
   * Load saved model
   */
  async load(path: string): Promise<void> {
    const tf = await getTF();
    this.encoder = await tf.loadLayersModel(`file://${path}/encoder/model.json`);
    this.decoder = await tf.loadLayersModel(`file://${path}/decoder/model.json`);
  }

  /**
   * Save model
   */
  async save(path: string): Promise<void> {
    if (!this.encoder || !this.decoder) {
      throw new Error('Model not built');
    }
    
    await this.encoder.save(`file://${path}/encoder`);
    await this.decoder.save(`file://${path}/decoder`);
  }

  getEncoder(): any {
    return this.encoder;
  }

  getDecoder(): any {
    return this.decoder;
  }
}
