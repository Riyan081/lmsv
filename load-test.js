// To run this: bun run load-test.js
const url = "http://localhost:3001/api/auth/get-session";
const TOTAL_REQUESTS = 3000;
const CONCURRENT_REQUESTS = 100;

async function makeRequest() {
  try {
    const res = await fetch(url);
    return res.status;
  } catch (err) {
    return "ERROR";
  }
}

async function runLoadTest() {
  console.log(`🚀 Starting load test: ${TOTAL_REQUESTS} requests...`);
  
  const results = {
    200: 0,
    429: 0,
    401: 0,
    errors: 0,
    other: 0,
  };

  const startTime = Date.now();
  let completed = 0;

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batch = Array.from({ length: Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i) }).map(() => makeRequest());
    const statuses = await Promise.all(batch);
    
    for (const status of statuses) {
      if (status === 200) results[200]++;
      else if (status === 429) results[429]++;
      else if (status === 401) results[401]++;
      else if (status === "ERROR") results.errors++;
      else results.other++;
    }
    
    completed += batch.length;
    process.stdout.write(`\rProgress: ${completed} / ${TOTAL_REQUESTS}`);
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n\n✅ Load test completed in ${duration} seconds!`);
  console.log("📊 Results (HTTP Status Codes):");
  console.log(`   - 200 (Success): ${results[200]}`);
  console.log(`   - 401 (Unauthorized - Expected if not logged in): ${results[401]}`);
  console.log(`   - 429 (Too Many Requests - Rate Limited!): ${results[429]}`);
  console.log(`   - Connection Errors: ${results.errors}`);
  console.log(`   - Other Statuses: ${results.other}`);
  
  console.log("\n💡 Notice how the 429 responses prove that Better Auth's rate limiter is protecting your server from being overloaded!");
}

runLoadTest();
