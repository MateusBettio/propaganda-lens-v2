export interface Metadata {
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

/**
 * Fetch URL metadata - try screenshot first for most reliable previews
 */
export async function fetchMetadata(url: string): Promise<Metadata> {
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const domain = new URL(url).hostname;

  // Use Microlink with screenshot - this is what most preview services do
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&viewport.width=1280&viewport.height=720`;
    console.log('Fetching with screenshot:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Microlink response status:', data.status);
    
    if (data.status === 'success' && data.data) {
      // Prefer screenshot, then OG image, then logo
      const imageUrl = 
        data.data.screenshot?.url ||    // Generated screenshot 
        data.data.image?.url ||         // OG image
        data.data.logo?.url ||          // Site logo
        null;
      
      console.log('Available images:');
      console.log('- Screenshot:', data.data.screenshot?.url);
      console.log('- OG Image:', data.data.image?.url);  
      console.log('- Logo:', data.data.logo?.url);
      console.log('- Using:', imageUrl);
      
      return {
        title: data.data.title || domain,
        description: data.data.description || 'Website preview',
        image: imageUrl,
        domain
      };
    }
  } catch (error) {
    console.log('Screenshot fetch failed:', error);
  }

  // Fallback: Try without screenshot
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      const imageUrl = data.data.image?.url || data.data.logo?.url;
      
      return {
        title: data.data.title || domain,
        description: data.data.description || 'Website preview',
        image: imageUrl,
        domain
      };
    }
  } catch (error) {
    console.log('Fallback fetch failed:', error);
  }

  // Final fallback
  return {
    title: domain,
    description: 'Website preview',
    domain
  };
}