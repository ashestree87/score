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
    const bodyText = await request.text();
    logs.push(`Raw request body: ${bodyText.substring(0, 500)}${bodyText.length > 500 ? '...' : ''}`);
    
    // Parse the JSON
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (parseError) {
      logs.push(`JSON parse error: ${parseError.message}`);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON format", 
        details: parseError.message,
        logs: logs
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    logs.push(`Received data for: ${data.name || 'Unknown'}, Email: ${data.email || 'None'}`);
    logs.push(`Original data object keys: ${Object.keys(data).join(', ')}`);
    
    // Validate data and set defaults for required fields
    if (!data.name) {
      data.name = "Anonymous";
      logs.push("Name was missing, defaulted to 'Anonymous'");
    }
    
    if (data.score === undefined || data.score === null) {
      data.score = 75; // Default score if missing
      logs.push(`Score was missing, defaulted to: ${data.score}`);
    } else {
      // Ensure score is a number
      const parsedScore = parseInt(data.score);
      if (isNaN(parsedScore)) {
        logs.push(`Score was not a valid number: "${data.score}", defaulting to 75`);
        data.score = 75;
      } else {
        data.score = parsedScore;
        logs.push(`Validated score: ${data.score}`);
      }
    }
    
    // Ensure arrays are properly initialized
    if (!Array.isArray(data.interests)) {
      data.interests = [];
      logs.push("Interests was not an array, defaulted to empty array");
    }
    
    if (!Array.isArray(data.preferred_resources)) {
      data.preferred_resources = [];
      logs.push("Preferred resources was not an array, defaulted to empty array");
    }
    
    // Ensure string fields exist
    const stringFields = ['primary_goal', 'time_commitment', 'experience_level', 'challenges', 'timeline', 'email'];
    stringFields.forEach(field => {
      if (typeof data[field] !== 'string') {
        data[field] = data[field] ? String(data[field]) : "";
        logs.push(`Field "${field}" was not a string, converted to: "${data[field]}"`);
      }
    });
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
      logs.push(`Added timestamp: ${data.timestamp}`);
    }
    
    // Log the validated data object
    logs.push(`Validated data: ${JSON.stringify({
      name: data.name,
      email: data.email,
      score: data.score,
      interests: data.interests,
      primary_goal: data.primary_goal,
      time_commitment: data.time_commitment,
      experience_level: data.experience_level,
      preferred_resources: data.preferred_resources,
      challenges: data.challenges,
      timeline: data.timeline
    })}`);
    
    // Generate a unique key for the submission
    const submissionId = crypto.randomUUID();
    const key = `submission:${submissionId}`;
    logs.push(`Generated submission ID: ${submissionId}`);
    
    // Log available bindings
    logs.push(`Available bindings: ${Object.keys(env).join(', ')}`);
    
    // Store in KV - using SCORE_KV instead of SCORES_KV
    if (env.SCORE_KV) {
      logs.push("KV namespace found, attempting to store data");
      try {
        const jsonData = JSON.stringify(data);
        logs.push(`Serialized JSON data (first 100 chars): ${jsonData.substring(0, 100)}...`);
        
        await env.SCORE_KV.put(key, jsonData);
        logs.push("Successfully stored data in KV");
        
        // Verify storage by reading it back
        const readBack = await env.SCORE_KV.get(key);
        logs.push(`KV verification - data retrieved: ${readBack ? 'yes' : 'no'}`);
        if (readBack) {
          logs.push(`KV data length: ${readBack.length} characters`);
        }
      } catch (kvError) {
        logs.push(`KV storage error: ${kvError.message}`);
        logs.push(`KV error stack: ${kvError.stack || 'No stack trace'}`);
      }
    } else {
      logs.push("WARNING: KV namespace not found");
    }
    
    // Store in D1 database - using SCORE_DB instead of DB
    if (env.SCORE_DB) {
      logs.push("D1 database found, attempting to store data");
      try {
        // This assumes you have a "submissions" table created
        const stmt = env.SCORE_DB.prepare(
          `INSERT INTO submissions (id, name, email, score, data, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`
        );
        
        const jsonData = JSON.stringify(data);
        logs.push(`Prepared D1 insert statement with: 
          id: ${submissionId}
          name: ${data.name}
          email: ${data.email}
          score: ${data.score}
          data: ${jsonData.substring(0, 50)}...
          created_at: ${data.timestamp}`);
        
        const result = await stmt.bind(
          submissionId,
          data.name,
          data.email,
          data.score,
          jsonData,
          data.timestamp
        ).run();
        
        logs.push(`D1 insert result: ${JSON.stringify(result)}`);
        logs.push("Successfully stored data in D1 database");
        
        // Confirm data was stored by reading it back
        const readCheck = await env.SCORE_DB.prepare(
          `SELECT * FROM submissions WHERE id = ?`
        ).bind(submissionId).all();
        
        if (readCheck.results && readCheck.results.length > 0) {
          logs.push(`Read check from DB: Found ${readCheck.results.length} records`);
          const firstResult = readCheck.results[0];
          logs.push(`D1 verification - record retrieved: name=${firstResult.name}, score=${firstResult.score}`);
        } else {
          logs.push("D1 verification - No records found, this might indicate a problem");
        }
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
      data: data, // Return the data that was stored for verification
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