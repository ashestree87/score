# Troubleshooting Guide

## Data Storage Issues

If you're experiencing issues with data not being stored correctly in Cloudflare KV or D1, follow this troubleshooting guide.

### Common Issues

1. **Empty or Missing Data in KV/D1 Database**
   - **Symptom**: Data appears as empty strings or null values in the database
   - **Cause**: Form data might not be correctly passed through the quiz flow

2. **Zero Score**
   - **Symptom**: Score always shows as 0 in the database
   - **Cause**: Score calculation issue or incorrect passing of score parameter

3. **Binding Not Found Errors**
   - **Symptom**: Logs show "WARNING: KV namespace not found" or "WARNING: D1 database not found"
   - **Cause**: Incorrect binding names in wrangler.toml or missing resources

### Diagnostic Steps

#### 1. Test Direct Submission

Use the test submission page to create a test entry with guaranteed valid data:

```
https://your-domain.com/test-submission
```

This bypasses the quiz form and creates a direct submission with predefined values.

#### 2. Check API Logs

View the logs on the results page after a submission:

1. Complete a quiz
2. On the results page, click "Show Debug Info"
3. Check if there are any errors or warnings in the logs
4. Verify that the submission data looks correct before it's sent

#### 3. Check Admin API

Use the admin API to view the stored data:

```
https://your-domain.com/api/admin?action=list&token=your_admin_token_here
```

Look for:
- Correct binding names (should be SCORE_KV and SCORE_DB)
- Data structure and format
- Presence of all expected fields

#### 4. Use the Test Data Endpoint

The test data endpoint will check if your KV/D1 bindings are working correctly:

```
https://your-domain.com/api/test-data?token=your_admin_token_here
```

This endpoint:
1. Creates a test item
2. Stores it in both KV and D1
3. Reads it back to verify storage
4. Shows a sample of existing data

### Fixing Common Issues

#### Binding Name Issues

Make sure your wrangler.toml file uses the correct binding names:

```toml
# KV Namespace binding
[[kv_namespaces]]
binding = "SCORE_KV"  # Must be SCORE_KV, not SCORES_KV
id = "your_kv_id_here"

# D1 Database binding
[[d1_databases]]
binding = "SCORE_DB"  # Must be SCORE_DB, not DB
database_name = "score_db"
database_id = "your_d1_id_here"
```

#### Form Data Issues

If form data isn't being passed correctly:

1. Check each quiz question page to ensure it properly forwards all previous form data
2. Verify the hidden input fields in each form have the correct names
3. Monitor the URL parameters as you progress through the quiz

#### Database Schema Issues

For D1 database issues, ensure your schema is correct:

1. Run the schema check: `/api/admin?action=schema&token=your_admin_token_here`
2. Make sure the submissions table has these columns: id, name, email, score, data, created_at
3. If needed, run the schema.sql again:

```bash
wrangler d1 execute score_db --file=./schema.sql
```

### Still Having Issues?

If these steps don't resolve your issue:

1. Try the test page with network monitoring open in your browser's developer tools
2. Check if the request to /api/quiz-submissions has the correct payload
3. Verify that the response is successful (201 status)
4. Check the Cloudflare dashboard for any errors in your Workers logs

If you need more detailed logging, add additional log statements to the quiz-submissions.js file and redeploy. 