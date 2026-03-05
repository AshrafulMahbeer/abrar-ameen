import fs from "fs";
import path from "path";

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

  const { id } = req.query;

  if (!id) {
    res.status(400).send("Missing id");
    return;
  }

  const filePath = path.join("/tmp", id);
  const dir = path.dirname(filePath);

  fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(filePath);

  req.pipe(stream);

  await new Promise(resolve => stream.on("finish", resolve));

  await new Promise(r => setTimeout(r, 7000));

  res.status(200).send("OK");
}
