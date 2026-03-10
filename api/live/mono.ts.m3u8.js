export default async function handler(req, res) {

  const LIVE_URL = "https://live-hz-12.livepush.io/live/emNsRVm3A86j8F9/chunks.m3u8";

  const SEGMENT_DURATION = 10;
  const WINDOW_SIZE = 6;
  const MAX_SEGMENTS = 298;

  const ANCHOR_TIME = new Date("2025-01-01T00:00:00Z").getTime();
  const now = Date.now();

  let playlist = "";
  let liveActive = false;

  try {

    const r = await fetch(LIVE_URL, { cache: "no-store" });

    if (r.ok) {

      const text = await r.text();

      if (text.includes("#EXTINF")) {

        liveActive = true;

        const lines = text.split("\n");

        let mediaSequence = 0;

        for (const l of lines) {
          if (l.startsWith("#EXT-X-MEDIA-SEQUENCE")) {
            mediaSequence = parseInt(l.split(":")[1]);
          }
        }

        playlist += `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:7
#EXT-X-DISCONTINUITY
`;

        for (let i = 0; i < lines.length; i++) {

          const line = lines[i].trim();

          if (line.startsWith("#EXTINF")) {
            playlist += line + "\n";

            const seg = lines[i + 1].trim();

            const absolute = new URL(seg, LIVE_URL).href;

            playlist += absolute + "\n";
          }
        }
      }
    }

  } catch (e) {}

  if (!liveActive) {

    const elapsedSeconds = Math.floor((now - ANCHOR_TIME) / 1000);
    const segmentNumber = Math.floor(elapsedSeconds / SEGMENT_DURATION);

    const firstSegment = segmentNumber - WINDOW_SIZE + 1;
    const mediaSequence = firstSegment;

    playlist += `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${SEGMENT_DURATION}
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-DISCONTINUITY
`;

    for (let i = 0; i < WINDOW_SIZE; i++) {

      const segNum = firstSegment + i;

      if (segNum < 0) continue;

      const fileIndex = segNum % MAX_SEGMENTS;

      if (segNum > 0 && fileIndex === 0) {
        playlist += "#EXT-X-DISCONTINUITY\n";
      }

      playlist += `#EXTINF:${SEGMENT_DURATION}.0,\n`;
      playlist += `https://radio-ashraful.vercel.app/radio/hls/${fileIndex}.ts?v=${segNum}\n`;
    }
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).send(playlist);
}
