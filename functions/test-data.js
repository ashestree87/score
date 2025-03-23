/**
 * Test script for checking data in SCORE_KV and SCORE_DB
 * To use this, deploy to Cloudflare and visit /test-data?token=your_admin_token
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // Simple authentication
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token || token !== (env.ADMIN_TOKEN || 'insecure_dev_token_please_change')) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized. Add ?token=your_admin_token to the URL."
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Initialize data structures to hold our test results
  const results = {
    timestamp: new Date().toISOString(),
    test_item: {
      id: crypto.randomUUID(),
      name: "Test User",
      email: "test@example.com",
      score: 85,
      primary_goal: "test_goal",
      time_commitment: "moderate",
      experience_level: "intermediate",
      timestamp: new Date().toISOString()
    },
    kv_test: { status: 'pending' },
    db_test: { status: 'pending' },
    existing_data: {
      kv: { status: 'pending' },
      db: { status: 'pending' }
    }
  };
  
  // Test KV namespace
  if (env.SCORE_KV) {
    try {
      // Store test data
      const testKey = `test:${results.test_item.id}`;
      await env.SCORE_KV.put(testKey, JSON.stringify(results.test_item));
      
      // Read it back
      const readBack = await env.SCORE_KV.get(testKey, 'json');
      
      // Verify it matches
      results.kv_test = {
        status: 'success',
        key: testKey,
        write_success: true,
        read_success: !!readBack,
        data_matches: JSON.stringify(readBack) === JSON.stringify(results.test_item)
      };
      
      // Clean up
      await env.SCORE_KV.delete(testKey);
      
      // Check existing data
      const keys = await env.SCORE_KV.list({ prefix: 'submission:' });
      results.existing_data.kv = {
        status: 'success',
        count: keys.keys.length,
        sample: keys.keys.length > 0 ? 
          await env.SCORE_KV.get(keys.keys[0].name, 'json') : null
      };
    } catch (error) {
      results.kv_test = {
        status: 'error',
        message: error.message,
        stack: error.stack
      };
    }
  } else {
    results.kv_test = {
      status: 'not_available',
      message: 'SCORE_KV binding not found'
    };
  }
  
  // Test D1 database
  if (env.SCORE_DB) {
    try {
      // Check if table exists
      const { results: tables } = await env.SCORE_DB.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'`
      ).all();
      
      if (tables && tables.length > 0) {
        // Table exists, try inserting test data
        const testId = results.test_item.id;
        
        await env.SCORE_DB.prepare(
          `INSERT INTO submissions (id, name, email, score, data, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          testId,
          results.test_item.name,
          results.test_item.email,
          results.test_item.score,
          JSON.stringify(results.test_item),
          results.test_item.timestamp
        ).run();
        
        // Read it back
        const { results: readBack } = await env.SCORE_DB.prepare(
          `SELECT * FROM submissions WHERE id = ?`
        ).bind(testId).all();
        
        // Verify it worked
        results.db_test = {
          status: 'success',
          table_exists: true,
          write_success: true,
          read_success: readBack && readBack.length > 0,
          read_data: readBack && readBack.length > 0 ? readBack[0] : null
        };
        
        // Clean up
        await env.SCORE_DB.prepare(
          `DELETE FROM submissions WHERE id = ?`
        ).bind(testId).run();
        
        // Check existing data
        const { results: existingData } = await env.SCORE_DB.prepare(
          `SELECT * FROM submissions ORDER BY created_at DESC LIMIT 5`
        ).all();
        
        results.existing_data.db = {
          status: 'success',
          count: existingData ? existingData.length : 0,
          sample: existingData && existingData.length > 0 ? existingData : []
        };
      } else {
        results.db_test = {
          status: 'error',
          message: 'submissions table does not exist'
        };
      }
    } catch (error) {
      results.db_test = {
        status: 'error',
        message: error.message,
        stack: error.stack
      };
    }
  } else {
    results.db_test = {
      status: 'not_available',
      message: 'SCORE_DB binding not found'
    };
  }
  
  // Return results as JSON
  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
} 