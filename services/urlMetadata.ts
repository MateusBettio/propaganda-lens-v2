interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  siteName?: string;
  favicon?: string;
}

/**
 * Parse HTML to extract metadata
 */
function parseHtmlMetadata(html: string, url: string): URLMetadata {
  const metadata: URLMetadata = {
    domain: new URL(url).hostname
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract Open Graph tags
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    metadata.title = ogTitleMatch[1];
  }

  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  if (ogDescMatch) {
    metadata.description = ogDescMatch[1];
  }

  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    let imageUrl = ogImageMatch[1];
    // Handle relative URLs
    if (!imageUrl.startsWith('http')) {
      const baseUrl = new URL(url);
      imageUrl = imageUrl.startsWith('/') 
        ? `${baseUrl.protocol}//${baseUrl.host}${imageUrl}`
        : `${baseUrl.protocol}//${baseUrl.host}/${imageUrl}`;
    }
    metadata.image = imageUrl;
  }

  const ogSiteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
  if (ogSiteMatch) {
    metadata.siteName = ogSiteMatch[1];
  }

  // Extract regular meta description if no OG description
  if (!metadata.description) {
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
      metadata.description = descMatch[1];
    }
  }

  return metadata;
}

/**
 * Fetches metadata from a URL using various methods
 * First tries to use a metadata API service, then falls back to fetching and parsing HTML
 */
export async function fetchUrlMetadata(url: string): Promise<URLMetadata> {
  try {
    // First attempt: Use a simple iframe/unfurler service
    // Many sites block CORS, so we'll use a proxy service
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetadataBot/1.0)'
        }
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const html = await response.text();
        const metadata = parseHtmlMetadata(html, url);
        if (metadata.title || metadata.image) {
          return metadata;
        }
      }
    } catch (error) {
      console.log('Proxy fetch failed:', error);
    }

    // Second attempt: Use Open Graph API service
    const ogApiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=demo`;
    
    try {
      const response = await fetch(ogApiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.openGraph) {
          return {
            title: data.openGraph.title || data.hybridGraph?.title || '',
            description: data.openGraph.description || data.hybridGraph?.description || '',
            image: data.openGraph.image?.url || data.hybridGraph?.image || '',
            domain: new URL(url).hostname,
            siteName: data.openGraph.site_name || new URL(url).hostname,
          };
        }
      }
    } catch (error) {
      console.log('OpenGraph API failed:', error);
    }

    // Final fallback: Use CORS proxy to fetch the HTML and parse it
    const corsProxy = 'https://corsproxy.io/?';
    const proxiedUrl = corsProxy + encodeURIComponent(url);
    
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();
    
    // Parse metadata from HTML
    return parseHtmlMetadata(html, url);
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    
    // Return basic metadata even on error
    return {
      domain: new URL(url).hostname,
      title: new URL(url).hostname,
      description: 'Unable to load preview'
    };
  }
}

/**
 * Alternative: Use a dedicated metadata service with API key
 * This is more reliable but requires API key setup
 */
export async function fetchUrlMetadataWithApiKey(url: string, apiKey: string): Promise<URLMetadata> {
  try {
    // Using LinkPreview.net API (requires free API key from https://linkpreview.net)
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      domain: new URL(url).hostname,
      siteName: new URL(url).hostname,
    };
  } catch (error) {
    console.error('Error fetching URL metadata with API:', error);
    return {
      domain: new URL(url).hostname,
      title: new URL(url).hostname,
      description: 'Unable to load preview'
    };
  }
}