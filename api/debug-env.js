export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    hasUrl: !!process.env.KV_REST_API_URL,
    hasToken: !!process.env.KV_REST_API_TOKEN,
    hasKvUrl: !!process.env.KV_URL,
    hasStorageUrl: !!process.env.STORAGE_URL,
    urlPrefix: process.env.KV_REST_API_URL ? process.env.KV_REST_API_URL.substring(0, 20) : 'none'
  });
}
