export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.status(405).send("POST only");
    return;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks);

  res.setHeader("Content-Type", req.headers["content-type"] || "application/octet-stream");

  // 60s cache
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

  res.status(200).send(body);
}
