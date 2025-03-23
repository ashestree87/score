/**
 * Quiz submission handler using Cloudflare Bindings
 * This function receives quiz data and stores it in KV and/or D1
 */
export async function onRequest(context) {
  // Destructure the context to get access to bindings
  const { request, env } = context;
  
  // Initialize a log array to collect debugging information
  const logs = ["Quiz submission handler started"];
  
  // Only allow POST requests
  if (request.method !== "POST") {
    logs.push(`Rejected ${request.method} request`);
    return new Response(JSON.stringify({ 
      error: "Method not allowed",
      logs
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  
  try {
    // Parse the incoming JSON data
    logs.push("Parsing request body");
    const data = await request.json();
    logs.push(`Received data for: ${data.name || 'Unknown'}, Email: ${data.email || 'None'}`);
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
      logs.push(`Added timestamp: ${data.timestamp}`);
    }
    
    // Generate a unique key for the submission
    const submissionId = crypto.randomUUID();
    const key = `submission:${submissionId}`;
    logs.push(`Generated submission ID: ${submissionId}`);
    
    // Log available bindings
    logs.push(`Available bindings: ${Object.keys(env).join(', ')}`);
    
    // Store in KV
    if (env.SCORES_KV) {
      logs.push("KV namespace found, attempting to store data");
      try {
        await env.SCORES_KV.put(key, JSON.stringify(data));
        logs.push("Successfully stored data in KV");
      } catch (kvError) {
        logs.push(`KV storage error: ${kvError.message}`);
      }
    } else {
      logs.push("WARNING: KV namespace not found");
    }
    
    // Store in D1 database if available
    if (env.DB) {
      logs.push("D1 database found, attempting to store data");
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
        logs.push("Successfully stored data in D1 database");
        
        // Confirm data was stored by reading it back
        const readCheck = await env.DB.prepare(
          `SELECT * FROM submissions WHERE id = ?`
        ).bind(submissionId).all();
        logs.push(`Read check from DB: Found ${readCheck.results?.length || 0} records`);
      } catch (dbError) {
        logs.push(`Database error: ${dbError.message}`);
        logs.push(`Error stack: ${dbError.stack || 'No stack trace'}`);
        // Continue even if DB operation fails
      }
    } else {
      logs.push("WARNING: D1 database not found");
    }
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      id: submissionId,
      message: "Quiz submission recorded successfully",
      logs: logs
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    logs.push(`Error processing quiz submission: ${error.message}`);
    logs.push(`Error stack: ${error.stack || 'No stack trace'}`);
    
    return new Response(JSON.stringify({ 
      error: "Failed to process submission", 
      details: error.message,
      logs: logs
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
} 