'use server';
/**
 * @fileOverview AI agent that generates a short story based on an image.
 *
 * - generateStoryFromImage - A function that handles the story generation process.
 * - GenerateStoryFromImageInput - The input type for the generateStoryFromImage function.
 * - GenerateStoryFromImageOutput - The return type for the generateStoryFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a story from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateStoryFromImageInput = z.infer<typeof GenerateStoryFromImageInputSchema>;

const GenerateStoryFromImageOutputSchema = z.object({
  story: z.string().describe('A short story generated based on the image.'),
});
export type GenerateStoryFromImageOutput = z.infer<typeof GenerateStoryFromImageOutputSchema>;

export async function generateStoryFromImage(input: GenerateStoryFromImageInput): Promise<GenerateStoryFromImageOutput> {
  return generateStoryFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryFromImagePrompt',
  input: {schema: GenerateStoryFromImageInputSchema},
  output: {schema: GenerateStoryFromImageOutputSchema},
  prompt: `You are a creative story writer. Generate a short story based on the content of the following image:

{{media url=photoDataUri}}

Write a captivating story that brings the image to life.`,
});

const generateStoryFromImageFlow = ai.defineFlow(
  {
    name: 'generateStoryFromImageFlow',
    inputSchema: GenerateStoryFromImageInputSchema,
    outputSchema: GenerateStoryFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
