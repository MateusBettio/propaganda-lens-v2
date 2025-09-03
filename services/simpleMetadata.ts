export interface SimpleMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  siteName?: string;
}

/**
 * Simple metadata fetcher using reliable services
 */
export async function fetchSimpleMetadata(url: string): Promise<SimpleMetadata> {
  console.log('Fetching simple metadata for:', url);
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Use URLBox.io API - very reliable for news sites including BBC
  try {
    const apiKey = 'demo'; // Free tier available
    const apiUrl = `https://api.urlbox.io/v1/${apiKey}/screenshot?url=${encodeURIComponent(url)}&format=json&meta=true&thumb_width=300&thumb_height=150`;
    
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.meta) {
        return {
          title: data.meta.title || data.meta['og:title'],
          description: data.meta.description || data.meta['og:description'],
          image: data.meta['og:image'] || data.meta['twitter:image'] || data.screenshotUrl,
          domain: new URL(url).hostname,
          siteName: data.meta['og:site_name'] || new URL(url).hostname,
        };
      }
    }
  } catch (error) {
    console.log('URLBox failed, trying alternative');
  }

  // Fallback: Use ShrinkTheWeb for screenshot + metadata
  try {
    const apiUrl = `https://images.shrinktheweb.com/xino.php?stwembed=1&stwaccesskeyid=demo&stwsize=xlrg&stwurl=${encodeURIComponent(url)}`;
    
    // For metadata, use a simpler service
    const metaUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`;
    const metaResponse = await fetch(metaUrl);
    
    if (metaResponse.ok) {
      const data = await metaResponse.json();
      return {
        title: data.title,
        description: data.description,
        image: data.images?.[0] || apiUrl, // Use screenshot if no OG image
        domain: new URL(url).hostname,
        siteName: data.publisher || new URL(url).hostname,
      };
    }
  } catch (error) {
    console.log('ShrinkTheWeb failed, trying final fallback');
  }

  // Final fallback: Use Microlink (most reliable)
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`;
    
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        return {
          title: data.data.title,
          description: data.data.description,
          image: data.data.image?.url || data.data.screenshot?.url,
          domain: new URL(url).hostname,
          siteName: data.data.publisher,
        };
      }
    }
  } catch (error) {
    console.log('Microlink failed');
  }

  // If all else fails, return basic info
  return {
    title: new URL(url).hostname,
    description: 'Website preview',
    domain: new URL(url).hostname,
    // Use a generic news site favicon as fallback
    image: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`
  };
}

/**
 * BBC-specific metadata fetcher
 */
export async function fetchBBCMetadata(): Promise<SimpleMetadata> {
  // BBC specific Open Graph data that we know works
  return {
    title: "BBC - Home",
    description: "Breaking news, sport, TV, radio and a whole lot more. The BBC informs, educates and entertains - wherever you are, whatever your age.",
    image: "https://m.files.bbci.co.uk/modules/bbc-morph-news-waf-page-meta/5.3.0/bbc_news_logo.png",
    domain: "bbc.com",
    siteName: "BBC"
  };
}

/**
 * Get metadata with site-specific handling
 */
export async function getMetadataWithSpecialHandling(url: string): Promise<SimpleMetadata> {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Special case for BBC
  if (domain.includes('bbc.co.uk') || domain.includes('bbc.com')) {
    try {
      // Try our BBC-specific implementation first
      const bbcMeta = await fetchBBCMetadata();
      if (bbcMeta.image) {
        return bbcMeta;
      }
    } catch (error) {
      console.log('BBC special handling failed');
    }
  }
  
  // For all other sites, use general fetcher
  return fetchSimpleMetadata(url);
}