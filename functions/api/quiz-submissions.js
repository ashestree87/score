/**
 * Quiz submission handler using Cloudflare Bindings
 * This function receives quiz data and stores it in KV and/or D1
 */
export async function onRequest(context) {
  // Destructure the context to get access to bindings
  const { request, env } = context;
  
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  
  try {
    // Parse the incoming JSON data
    const data = await request.json();
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Generate a unique key for the submission
    const submissionId = crypto.randomUUID();
    const key = `submission:${submissionId}`;
    
    // Log the API key from environment variable (for development only)
    console.log(`Using API key: ${env.API_KEY}`);
    
    // Store in KV
    if (env.SCORES_KV) {
      await env.SCORES_KV.put(key, JSON.stringify(data));
    }
    
    // Store in D1 database if available
    if (env.DB) {
      try {
        // This assumes you have a "submissions" table created
        const stmt = env.DB.prepare(
          `INSERT INTO submissions (id, name, email, score, data, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`
        );
        
        await stmt.bind(
          submissionId,
          data.name || "Anonymous",
          data.email || "",
          data.score || 0,
          JSON.stringify(data),
          data.timestamp
        ).run();
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue even if DB operation fails
      }
    }
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      id: submissionId,
      message: "Quiz submission recorded successfully" 
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    console.error("Error processing quiz submission:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to process submission", 
      details: error.message 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
} 