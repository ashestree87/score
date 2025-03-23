/**
 * Admin API endpoint for checking stored data
 * WARNING: Protected by a simple token-based authentication
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // Initialize results object
  const results = {
    kv: { status: 'unknown', data: [] },
    d1: { status: 'unknown', data: [] },
    logs: []
  };
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const token = url.searchParams.get('token');
    
    // Simple authentication - require a token
    const adminToken = env.ADMIN_TOKEN || 'insecure_dev_token_please_change';
    if (!token || token !== adminToken) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized. Authentication required.",
        hint: "Add a valid token parameter to your request."
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    results.logs.push(`Requested action: ${action}`);
    
    // Check KV data
    if (env.SCORES_KV) {
      results.logs.push("KV namespace found");
      
      try {
        if (action === 'list') {
          // List all keys
          const keys = await env.SCORES_KV.list({ prefix: 'submission:' });
          results.kv.status = 'success';
          results.kv.count = keys.keys.length;
          results.logs.push(`Found ${keys.keys.length} keys in KV`);
          
          // Get the most recent submissions (limited by limit parameter)
          const recentKeys = keys.keys.slice(0, limit);
          
          // Get the values for each key
          for (const key of recentKeys) {
            const value = await env.SCORES_KV.get(key.name, 'json');
            if (value) {
              results.kv.data.push({
                key: key.name,
                value: value
              });
            }
          }
        }
      } catch (kvError) {
        results.kv.status = 'error';
        results.kv.error = kvError.message;
        results.logs.push(`KV error: ${kvError.message}`);
      }
    } else {
      results.kv.status = 'not_available';
      results.logs.push("KV namespace not available");
    }
    
    // Check D1 data
    if (env.DB) {
      results.logs.push("D1 database found");
      
      try {
        if (action === 'list') {
          // Query the submissions table
          const { results: dbResults } = await env.DB.prepare(
            `SELECT * FROM submissions ORDER BY created_at DESC LIMIT ?`
          ).bind(limit).all();
          
          results.d1.status = 'success';
          results.d1.data = dbResults || [];
          results.d1.count = dbResults ? dbResults.length : 0;
          results.logs.push(`Found ${results.d1.count} records in D1`);
        } else if (action === 'schema') {
          // Get table schema
          const { results: tables } = await env.DB.prepare(
            `SELECT name FROM sqlite_master WHERE type='table'`
          ).all();
          
          results.d1.status = 'success';
          results.d1.tables = tables || [];
          results.logs.push(`Found ${tables ? tables.length : 0} tables in D1`);
          
          // Get schema for each table
          if (tables && tables.length > 0) {
            results.d1.schema = {};
            for (const table of tables) {
              const { results: columns } = await env.DB.prepare(
                `PRAGMA table_info(${table.name})`
              ).all();
              results.d1.schema[table.name] = columns || [];
            }
          }
        }
      } catch (dbError) {
        results.d1.status = 'error';
        results.d1.error = dbError.message;
        results.logs.push(`D1 error: ${dbError.message}`);
        results.logs.push(`D1 error stack: ${dbError.stack || 'No stack trace'}`);
      }
    } else {
      results.d1.status = 'not_available';
      results.logs.push("D1 database not available");
    }
    
    // Return the results
    return new Response(JSON.stringify(results, null, 2), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    results.status = 'error';
    results.error = error.message;
    results.logs.push(`Error in admin endpoint: ${error.message}`);
    
    return new Response(JSON.stringify(results, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 