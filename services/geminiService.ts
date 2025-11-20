
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateWallpapers(prompt: string, aspectRatio: AspectRatio): Promise<GeneratedImage[]> {
  try {
    console.log(`Generating images with prompt: "${prompt}" and aspect ratio: ${aspectRatio}`);
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `phone wallpaper, ${prompt}, cinematic, high detail, 8k`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    console.log("API Response received:", response);

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("API returned no images.");
    }

    const images: GeneratedImage[] = response.generatedImages.map(img => {
      if (!img.image || !img.image.imageBytes) {
        throw new Error("Invalid image data received from API.");
      }
      return {
        base64: img.image.imageBytes,
        prompt: prompt, 
      };
    });

    return images;
  } catch (error) {
    console.error("Error generating wallpapers:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate wallpapers: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
}
