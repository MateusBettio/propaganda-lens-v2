export interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  siteName?: string;
  favicon?: string;
  url?: string;
}

/**
 * Main function to fetch URL metadata with multiple strategies
 */
export async function fetchUrlMetadata(url: string): Promise<URLMetadata> {
  console.log('Fetching metadata for:', url);
  
  // Clean and validate URL
  try {
    // Ensure URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    url = urlObj.toString();
  } catch (error) {
    console.error('Invalid URL:', url, error);
    // Try to fix common URL issues
    try {
      const fixedUrl = 'https://' + url.replace(/^\/\//, '');
      const urlObj = new URL(fixedUrl);
      url = urlObj.toString();
    } catch (secondError) {
      return {
        domain: 'Invalid URL',
        title: 'Invalid URL',
        description: 'The provided URL is not valid'
      };
    }
  }

  // Try different strategies in order of reliability
  const strategies = [
    () => fetchViaMetaScraper(url),
    () => fetchViaOpenGraphNinja(url),
    () => fetchViaLinkPreview(url),
    () => fetchViaUnfurl(url),
    () => fetchViaAllOrigins(url),
  ];

  for (const strategy of strategies) {
    try {
      const metadata = await strategy();
      if (metadata && (metadata.title || metadata.image)) {
        console.log('Successfully fetched metadata:', metadata);
        return metadata;
      }
    } catch (error) {
      console.log('Strategy failed, trying next...', error);
    }
  }

  // Fallback to basic metadata
  return {
    domain: new URL(url).hostname,
    title: new URL(url).hostname,
    description: 'Unable to load preview',
    url: url
  };
}

/**
 * Strategy 1: Use metascraper API (most reliable for news sites)
 */
async function fetchViaMetaScraper(url: string): Promise<URLMetadata> {
  // Using a public microlink API which uses metascraper
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Microlink API failed');
  
  const data = await response.json();
  
  if (data.status === 'success' && data.data) {
    return {
      title: data.data.title,
      description: data.data.description,
      image: data.data.image?.url || data.data.screenshot?.url,
      domain: data.data.publisher || new URL(url).hostname,
      siteName: data.data.publisher,
      favicon: data.data.logo?.url,
      url: data.data.url
    };
  }
  
  throw new Error('No data from Microlink');
}

/**
 * Strategy 2: Use Open Graph Ninja API
 */
async function fetchViaOpenGraphNinja(url: string): Promise<URLMetadata> {
  const apiUrl = `https://opengraph.ninja/api/v1/fetch?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error('OpenGraph Ninja failed');
  
  const data = await response.json();
  
  if (data) {
    return {
      title: data.title || data.ogTitle,
      description: data.description || data.ogDescription,
      image: data.image || data.ogImage,
      domain: new URL(url).hostname,
      siteName: data.ogSiteName || new URL(url).hostname,
      url: url
    };
  }
  
  throw new Error('No data from OpenGraph Ninja');
}

/**
 * Strategy 3: Use LinkPreview API
 */
async function fetchViaLinkPreview(url: string): Promise<URLMetadata> {
  // Using the demo key - in production, you should get your own free key
  const apiUrl = `https://api.linkpreview.net/?key=5b54e80a65c77848ceaa4c71e0997ef993c2eb02586f0&q=${encodeURIComponent(url)}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('LinkPreview API failed');
  
  const data = await response.json();
  
  if (data && !data.error) {
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      domain: new URL(data.url || url).hostname,
      siteName: new URL(data.url || url).hostname,
      url: data.url || url
    };
  }
  
  throw new Error('No data from LinkPreview');
}

/**
 * Strategy 4: Use Unfurl API
 */
async function fetchViaUnfurl(url: string): Promise<URLMetadata> {
  const apiUrl = `https://unfurl.io/api/v2/preview?api_token=demo&url=${encodeURIComponent(url)}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Unfurl API failed');
  
  const data = await response.json();
  
  if (data) {
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      domain: new URL(url).hostname,
      siteName: data.site_name || new URL(url).hostname,
      favicon: data.favicon,
      url: url
    };
  }
  
  throw new Error('No data from Unfurl');
}

/**
 * Strategy 5: Fallback - Use AllOrigins proxy and parse HTML
 */
async function fetchViaAllOrigins(url: string): Promise<URLMetadata> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error('AllOrigins proxy failed');
  
  const data = await response.json();
  const html = data.contents;
  
  return parseHtmlMetadata(html, url);
}

/**
 * Parse HTML to extract Open Graph and meta tags
 */
function parseHtmlMetadata(html: string, url: string): URLMetadata {
  const metadata: URLMetadata = {
    domain: new URL(url).hostname,
    url: url
  };

  // Extract title - try multiple patterns
  const titlePatterns = [
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match) {
      metadata.title = match[1].trim();
      break;
    }
  }

  // Extract description - try multiple patterns
  const descPatterns = [
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i,
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i
  ];
  
  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match) {
      metadata.description = match[1].trim();
      break;
    }
  }

  // Extract image - try multiple patterns
  const imagePatterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /<meta\s+property=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
  ];
  
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match) {
      let imageUrl = match[1].trim();
      // Handle relative URLs
      if (!imageUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        imageUrl = imageUrl.startsWith('/') 
          ? `${baseUrl.protocol}//${baseUrl.host}${imageUrl}`
          : `${baseUrl.protocol}//${baseUrl.host}/${imageUrl}`;
      }
      metadata.image = imageUrl;
      break;
    }
  }

  // Extract site name
  const siteNamePatterns = [
    /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']og:site_name["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:site_name["']/i
  ];
  
  for (const pattern of siteNamePatterns) {
    const match = html.match(pattern);
    if (match) {
      metadata.siteName = match[1].trim();
      break;
    }
  }

  return metadata;
}

/**
 * Special handling for known sites that require specific approaches
 */
export async function fetchUrlMetadataWithFallbacks(url: string): Promise<URLMetadata> {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Special handling for BBC
  if (domain.includes('bbc.com') || domain.includes('bbc.co.uk')) {
    // BBC often blocks scrapers, use a specific approach
    try {
      // Try microlink first as it handles BBC well
      const metadata = await fetchViaMetaScraper(url);
      if (metadata.title && metadata.image) {
        return metadata;
      }
    } catch (error) {
      console.log('BBC special handling failed, using general approach');
    }
  }
  
  // Use general approach for all other sites
  return fetchUrlMetadata(url);
}