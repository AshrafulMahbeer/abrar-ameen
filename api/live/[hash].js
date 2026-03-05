export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const { hash } = req.query;

  const data = global.store?.[hash];

  if (!data) {
    res.status(404).end("Segment not found");
    return;
  }

  res.setHeader("Content-Type", data.type);
  res.setHeader("Cache-Control", "public, s-maxage=60"); // 60s edge cache
  res.status(200).send(data.body);
}
