import { Platform, NativeModules } from 'react-native';
import { RunAnywhere } from '@runanywhere/core';
import ImageResizer from 'react-native-image-resizer';

/**
 * VisionService - Handles image understanding and analysis
 *
 * Since VLM is not yet available in React Native RunAnywhere SDK,
 * we use a hybrid approach:
 * 1. Image classification using native ML (TFLite/CoreML)
 * 2. LLM for contextual explanation
 *
 * Future: Replace with RunAnywhere VLM when available
 */

export interface ImageAnalysisResult {
  detectedObjects: DetectedObject[];
  sceneDescription: string;
  aiExplanation: string;
  confidence: number;
  processingTimeMs: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  category: 'food' | 'medicine' | 'plant' | 'tool' | 'document' | 'emergency' | 'other';
}

// Native module for image classification (to be implemented)
const { ImageClassifierModule } = NativeModules;

export class VisionService {
  private static instance: VisionService;

  private constructor() {}

  static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  /**
   * Analyze an image and get AI-powered explanation
   */
  async analyzeImage(
    imageUri: string,
    userQuery?: string,
    context?: 'emergency' | 'food' | 'general'
  ): Promise<ImageAnalysisResult> {
    const startTime = Date.now();

    try {
      // Step 1: Resize image for faster processing
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        512, // max width
        512, // max height
        'JPEG',
        80,
        0
      );

      // Step 2: Classify image using native ML model
      const classification = await this.classifyImage(resizedImage.uri);

      // Step 3: Generate AI explanation using LLM
      const explanation = await this.generateExplanation(
        classification.detectedObjects,
        userQuery,
        context
      );

      const processingTimeMs = Date.now() - startTime;

      return {
        detectedObjects: classification.detectedObjects,
        sceneDescription: classification.sceneDescription,
        aiExplanation: explanation,
        confidence: classification.confidence,
        processingTimeMs,
      };
    } catch (error) {
      console.error('[VisionService] Analysis error:', error);
      throw new Error(`Image analysis failed: ${error}`);
    }
  }

  /**
   * Classify image using native ML models
   * iOS: CoreML, Android: TFLite
   */
  private async classifyImage(imageUri: string): Promise<{
    detectedObjects: DetectedObject[];
    sceneDescription: string;
    confidence: number;
  }> {
    // Check if native module is available
    if (!ImageClassifierModule) {
      // Fallback: Use mock classification for demo
      console.warn('[VisionService] Native classifier not available, using mock data');
      return this.mockClassification();
    }

    try {
      const result = await ImageClassifierModule.classifyImage(imageUri);
      return {
        detectedObjects: result.objects || [],
        sceneDescription: result.description || 'Unknown scene',
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error('[VisionService] Native classification failed:', error);
      return this.mockClassification();
    }
  }

  /**
   * Generate AI explanation using on-device LLM
   */
  private async generateExplanation(
    objects: DetectedObject[],
    userQuery?: string,
    context?: string
  ): Promise<string> {
    // Check if LLM is loaded
    const isLoaded = await RunAnywhere.isModelLoaded();
    if (!isLoaded) {
      throw new Error('LLM model not loaded. Please load the model first.');
    }

    // Build context-aware prompt
    const prompt = this.buildExplanationPrompt(objects, userQuery, context);

    // Generate explanation
    const result = await RunAnywhere.generate(prompt, {
      maxTokens: 200,
      temperature: 0.7,
      systemPrompt: this.getSystemPrompt(context),
    });

    return result.text;
  }

  /**
   * Build prompt for LLM based on detected objects
   */
  private buildExplanationPrompt(
    objects: DetectedObject[],
    userQuery?: string,
    context?: string
  ): string {
    const objectsList = objects
      .map((obj) => `${obj.label} (${(obj.confidence * 100).toFixed(0)}% confidence)`)
      .join(', ');

    let prompt = `I detected these objects in the image: ${objectsList}.\n\n`;

    if (userQuery) {
      prompt += `User question: ${userQuery}\n\n`;
    }

    switch (context) {
      case 'emergency':
        prompt += 'Provide immediate safety guidance and first aid steps if needed.';
        break;
      case 'food':
        prompt +=
          'Explain if this is safe to eat and provide nutritional information if available.';
        break;
      default:
        prompt += 'Explain what these objects are and how they can be used.';
    }

    return prompt;
  }

  /**
   * Get context-specific system prompt
   */
  private getSystemPrompt(context?: string): string {
    const basePrompt =
      'You are SurviLens AI, an offline assistant helping users understand their environment. ';

    switch (context) {
      case 'emergency':
        return (
          basePrompt +
          'Focus on safety, first aid, and survival guidance. Be clear, concise, and prioritize life-saving information.'
        );
      case 'food':
        return (
          basePrompt +
          'Focus on food safety, nutrition, and health information. Warn about allergens and potential risks.'
        );
      default:
        return (
          basePrompt +
          'Provide helpful, accurate, and practical information about objects and surroundings.'
        );
    }
  }

  /**
   * Mock classification for demo/testing
   * Remove this when native classifiers are implemented
   */
  private mockClassification(): {
    detectedObjects: DetectedObject[];
    sceneDescription: string;
    confidence: number;
  } {
    // TODO: Replace with actual classification
    return {
      detectedObjects: [
        { label: 'Plant', confidence: 0.85, category: 'plant' },
        { label: 'Leaf', confidence: 0.78, category: 'plant' },
      ],
      sceneDescription: 'A plant with green leaves',
      confidence: 0.82,
    };
  }

  /**
   * Categorize detected objects for quick filtering
   */
  categorizeObjects(objects: DetectedObject[]): Map<string, DetectedObject[]> {
    const categories = new Map<string, DetectedObject[]>();

    objects.forEach((obj) => {
      const category = obj.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(obj);
    });

    return categories;
  }

  /**
   * Check if image contains emergency-related objects
   */
  isEmergencyScene(objects: DetectedObject[]): boolean {
    return objects.some(
      (obj) =>
        obj.category === 'emergency' ||
        obj.label.toLowerCase().includes('injury') ||
        obj.label.toLowerCase().includes('fire') ||
        obj.label.toLowerCase().includes('danger')
    );
  }
}

export default VisionService.getInstance();
