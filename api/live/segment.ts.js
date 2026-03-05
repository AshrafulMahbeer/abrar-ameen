import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  const { id } = req.query;

  if (!id) {
    res.status(400).send("Missing id");
    return;
  }

  const filePath = path.join("/tmp", id);

  if (!fs.existsSync(filePath)) {
    res.status(404).send("Not found");
    return;
  }

  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=60, stale-while-revalidate=30"
  );

  res.setHeader("Content-Type", "video/mp2t");

  const stream = fs.createReadStream(filePath);

  stream.pipe(res);
}
