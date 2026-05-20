import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.STORAGE_URL,
  token: process.env.STORAGE_TOKEN,
});
export default redis;
