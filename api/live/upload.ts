export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Accept any method
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  if (!body || body.length === 0) {
    res.status(400).end("No data sent");
    return;
  }

  // Generate a simple unique hash (dependency-free)
  const timestamp = Date.now();
  const base64 = body.toString("base64").slice(0, 12); // first 12 chars of base64
  const hash = `${base64}_${timestamp}`;

  // Store in global memory (temporary)
  global.store = global.store || {};
  global.store[hash] = {
    body,
    type: req.headers["content-type"] || "application/octet-stream"
  };

  // Return GET URL
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({
    url: `/api/media/${hash}`
  }));
}
