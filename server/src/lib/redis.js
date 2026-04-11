const { Redis } = require('@upstash/redis');

// Initialize UPSTASH Redis client directly with environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = redis;
