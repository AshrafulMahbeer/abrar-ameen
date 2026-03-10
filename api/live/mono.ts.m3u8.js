let lastLiveSequence = null;

export default async function handler(req, res) {

  const LIVE_URL = "https://live-hz-12.livepush.io/live/emNsRVm3A86j8F9/chunks.m3u8";

  const SEGMENT_DURATION = 6;
  const WINDOW_SIZE = 6;
  const MAX_SEGMENTS = 298;

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

        lastLiveSequence = mediaSequence + WINDOW_SIZE;

        playlist += `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:7
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
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

    if (lastLiveSequence === null) {
      lastLiveSequence = 0;
    }

    const mediaSequence = lastLiveSequence;

    playlist += `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${SEGMENT_DURATION}
#EXT-X-DISCONTINUITY
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
`;

    for (let i = 0; i < WINDOW_SIZE; i++) {

      const seq = mediaSequence + i;
      const fileIndex = seq % MAX_SEGMENTS;

      playlist += `#EXTINF:${SEGMENT_DURATION}.0,\n`;
      playlist += `https://radio-ashraful.vercel.app/radio/hls/${fileIndex}.ts?v=${seq}\n`;
    }

    lastLiveSequence += WINDOW_SIZE;
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).send(playlist);
}
