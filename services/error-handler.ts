export function handleAnalysisError(error: unknown): Error {
  console.error('Analysis failed:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('Twitter API rate limit exceeded')) {
      return new Error('🐦 Twitter Rate Limit - You\'ve hit Twitter\'s rate limit. Please wait 15 minutes and try again, or try analyzing a different tweet.');
    }
    
    if (error.message.includes('Tweet not found')) {
      return new Error('🐦 Tweet Not Found - This tweet may have been deleted or the URL is incorrect. Please check the link and try again.');
    }
    
    if (error.message.includes('private or restricted')) {
      return new Error('🐦 Private Tweet - This tweet is private or restricted and cannot be accessed for analysis.');
    }
    
    if (error.message.includes('Twitter API authentication failed')) {
      return new Error('🐦 Twitter API Error - There\'s an issue with our Twitter integration. Please try again later.');
    }
    
    if (error.message.includes('OpenAI')) {
      return new Error('🤖 AI Analysis Error - Our AI analysis service is temporarily unavailable. Please try again in a few minutes.');
    }
    
    if (error.message.includes('timeout')) {
      return new Error('⏰ Timeout Error - The analysis took too long to complete. This may be due to heavy load. Please try again.');
    }
    
    if (error.message.includes('rate limit')) {
      return new Error('🚦 Rate Limit - Too many requests at once. Please wait a moment and try again.');
    }
    
    if (error.message.includes('Analysis failed:')) {
      return error;
    }
    
    if (error.message.includes('FunctionsHttpError')) {
      return new Error('⚙️ Service Error - Our analysis service encountered an issue. Please try again.');
    }
    
    return new Error(`❌ Analysis Error - ${error.message}. If this persists, please try a different URL.`);
  }
  
  return new Error('❌ Unknown Error - Something went wrong during analysis. Please try again with a different URL.');
}