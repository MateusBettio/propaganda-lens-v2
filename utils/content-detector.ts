export function detectContentType(input: string): 'text' | 'url' | 'youtube' | 'twitter' | 'tiktok' | 'image' {
  if (!input) return 'text';
  
  const patterns = {
    youtube: /(?:youtube\.com|youtu\.be)/i,
    twitter: /(?:twitter\.com|x\.com)/i,
    tiktok: /tiktok\.com/i,
    image: /\.(jpg|jpeg|png|gif|webp)$/i,
    url: /^https?:\/\//i,
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(input)) {
      return type as any;
    }
  }
  
  return 'text';
}