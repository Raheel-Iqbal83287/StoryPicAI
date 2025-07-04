'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { ImagePlus, Download, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateStoryAction } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

export function StoryGenerator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
        setError('Image size should be less than 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        setImageUrl(dataUrl);
        setIsLoading(true);
        setError(null);
        setStory(null);

        const result = await generateStoryAction(dataUrl);

        if (result.success && result.story) {
          setStory(result.story);
        } else {
          setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    if (!story) return;
    const blob = new Blob([story], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setImageUrl(null);
    setStory(null);
    setIsLoading(false);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">StoryPic AI</h1>
        <p className="text-lg md:text-xl text-foreground/80 animate-in fade-in slide-in-from-top-6 duration-1000">Transform your photos into captivating tales.</p>
      </header>

      <main>
        <Card className="w-full shadow-xl rounded-xl overflow-hidden transition-all duration-500 ease-in-out bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-8">
            {error && !isLoading && (
              <Alert variant="destructive" className="mb-4 animate-in fade-in">
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!imageUrl && (
              <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in duration-500">
                <ImagePlus className="w-16 h-16 text-accent mb-4" />
                <h2 className="text-2xl font-headline font-semibold mb-2">Upload a Photo</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">Let our AI weave a story from your image. Choose a photo to begin your adventure.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isLoading}
                />
                <Button onClick={handleUploadClick} size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Choose Photo'
                  )}
                </Button>
              </div>
            )}

            {imageUrl && (
              <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt="Uploaded preview"
                        width={500}
                        height={500}
                        className="rounded-lg object-cover aspect-square shadow-md"
                        data-ai-hint="uploaded photo"
                    />
                </div>
                <div className="flex flex-col justify-center min-h-[250px]">
                    {isLoading && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                                <h3 className="text-xl font-headline font-semibold">Generating your story...</h3>
                            </div>
                            <p className="text-muted-foreground">Our AI is dreaming up a world from your picture. This might take a moment.</p>
                            <div className="space-y-3 pt-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    )}
                    {story && !isLoading && (
                        <div className="space-y-4 animate-in fade-in duration-700">
                            <h3 className="text-2xl font-headline font-bold text-primary">Your Story</h3>
                            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{story}</p>
                        </div>
                    )}
                </div>
              </div>
            )}
            
            {(story || error) && !isLoading && (
              <div className="flex justify-center flex-wrap gap-4 mt-8 animate-in fade-in duration-500">
                  {story && (
                      <Button onClick={handleDownload}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Story
                      </Button>
                  )}
                  <Button onClick={handleReset} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Over
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
       <footer className="text-center mt-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
        <p>Powered by AI. Enjoy your unique story.</p>
      </footer>
    </div>
  );
}
