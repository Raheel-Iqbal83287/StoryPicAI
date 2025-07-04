'use server';

import { generateStoryFromImage } from '@/ai/flows/generate-story-from-image';
import { improveStoryQuality } from '@/ai/flows/improve-story-quality';

interface ActionResult {
  success: boolean;
  story?: string;
  error?: string;
}

export async function generateStoryAction(
  photoDataUri: string
): Promise<ActionResult> {
  if (!photoDataUri) {
    return { success: false, error: 'No image data provided.' };
  }

  try {
    // Generate the initial story
    const storyResult = await generateStoryFromImage({
      photoDataUri,
    });

    if (!storyResult.story) {
       return { success: false, error: 'The AI could not generate a story from this image. Please try a different one.' };
    }

    // Improve the story quality
    const improvedStoryResult = await improveStoryQuality({
        story: storyResult.story
    });

    return { success: true, story: improvedStoryResult.improvedStory };
  } catch (error) {
    console.error('Error in story generation flow:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the story. Please try again later.',
    };
  }
}
