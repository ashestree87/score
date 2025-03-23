/**
 * Main worker entry point for Cloudflare Pages Functions
 */

// Import the quiz submission handler
import { onRequest as quizSubmissionHandler } from './api/quiz-submissions.js';

// Map of paths to their handlers
const routes = {
  '/api/quiz-submissions': quizSubmissionHandler,
};

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Check if the path matches any of our API routes
    const handler = routes[url.pathname];
    
    if (handler) {
      // Pass the request to the appropriate handler
      return handler({ request, env, ctx });
    }
    
    // For static assets, let Cloudflare Pages handle the request
    // This will serve files from your dist directory
    return env.ASSETS.fetch(request);
  }
}; 