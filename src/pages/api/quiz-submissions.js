export const onRequestPost = async ({ request, env }) => {
  try {
    // Parse the incoming JSON data
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields' 
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
    // Note: In a real implementation, you would use env.QUIZ_SUBMISSIONS or similar KV namespace
    // await env.QUIZ_SUBMISSIONS.put(submissionId, JSON.stringify(submissionData));
    
    // For now, just log the data that would be stored
    console.log('Storing quiz submission:', submissionData);
    
    // In a real implementation, you might also:
    // 1. Send an email to the user with their results
    // 2. Store the data in a database for later analysis
    // 3. Trigger other workflows based on the submission
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quiz submission received',
        submissionId
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