// Dual implementation: 
// 1. Cloudflare Worker function for production
// 2. Mock API for local development

// For production deployment to Cloudflare Workers
export const onRequestPost = async ({ request, env }) => {
  try {
    // Parse the incoming JSON data
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields',
          error: 'Email and name are required'
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Generate a unique ID for this submission
    const submissionId = crypto.randomUUID();
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Prepare the data for storage
    const submissionData = {
      id: submissionId,
      ...data
    };
    
    // Store data in Cloudflare KV
    // Using the SCORE_KV binding if available
    if (env && env.SCORE_KV) {
      try {
        await env.SCORE_KV.put(submissionId, JSON.stringify(submissionData));
        console.log('Stored submission in KV:', submissionId);
      } catch (kvError) {
        console.error('Error storing in KV:', kvError);
      }
    } else {
      console.log('No KV binding available - data not persisted');
    }
    
    // Store in D1 database if available
    if (env && env.SCORE_DB) {
      try {
        // Simple insert - in a production app, you'd validate and sanitize fields
        const { name, email, score } = data;
        await env.SCORE_DB.prepare(
          `INSERT INTO submissions (id, name, email, score, data) 
           VALUES (?, ?, ?, ?, ?)`
        ).bind(
          submissionId, 
          name, 
          email, 
          score || 0, 
          JSON.stringify(data)
        ).run();
        console.log('Stored submission in D1:', submissionId);
      } catch (dbError) {
        console.error('Error storing in D1:', dbError);
      }
    }
    
    // Log the submission for debugging
    console.log('Quiz submission processed:', submissionData);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quiz submission received',
        submissionId,
        id: submissionId // Include both formats for compatibility
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Handle any errors
    console.error('Error processing quiz submission:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing submission',
        error: error.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// For local development with Astro dev server
export async function GET() {
  return new Response(JSON.stringify({
    success: true,
    message: 'Mock API endpoint for quiz submissions. Send a POST request with form data to submit quiz results.'
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(context) {
  try {
    // Parse the incoming JSON
    const request = context.request || context;
    console.log('Received quiz submission request');
    
    // Parse the submitted data
    const data = await request.json();
    console.log('Submission data:', data);
    
    // Validate required fields
    if (!data.email || !data.name) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields',
        error: 'Email and name are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate a mock ID
    const submissionId = 'local-' + Math.random().toString(36).substring(2, 10);
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Prepare the submission data
    const submissionData = {
      id: submissionId,
      ...data
    };
    
    // In development, store this in memory using the global hook from admin page
    if (typeof globalThis.captureLocalSubmission === 'function') {
      globalThis.captureLocalSubmission(submissionData);
      console.log('Captured submission for local admin panel');
    }
    
    // Simulate successful submission
    const response = {
      success: true,
      message: 'Quiz submission received',
      submissionId,
      id: submissionId, // Include both formats for compatibility
      data: submissionData
    };
    
    console.log('Responding with:', response);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing quiz submission:', error);
    
    // Handle invalid JSON
    let errorMessage = 'Invalid request format';
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      errorMessage = 'Invalid JSON format in request body';
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: errorMessage,
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 