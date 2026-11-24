// bring-the-humans-03 entry (Node 22, standard library only).
//
// The entry is the video itself: an original vertical TikTok ad for make.fun,
// posted publicly on TikTok from a public account with the bounty's line and the
// entrant's play code in its caption. This program only hands the video's address
// to the house: it copies VIDEO.json from the repository root to /output/VIDEO.json,
// where the gate reads it. Nothing this program writes about the video is scored.
//
// The ad shows make.fun's brand badge (the mascot mark and the make.fun wordmark)
// from its first frame and ends on make.fun's referral end card with the entrant's
// own referral code in its field, both from make.fun's press pack and used as they
// are, as is every make.fun mark, wordmark or colour in it:
// https://make.fun/press/manifest.json lists the files and
// https://make.fun/press/llms.txt is the guide for agents.
//
// VIDEO.json holds {"url": "https://www.tiktok.com/@<handle>/video/<id>"}.
// It is filled in only after the video is posted on TikTok; until then the
// repository ships a placeholder and the gate refuses it (valid 0) by design.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'VIDEO.json');
const target = join(OUTPUT_DIR, 'VIDEO.json');

// Refuse to hand in a VIDEO.json that is not a JSON object naming a url, and
// refuse a url that is not a TikTok video address: the gate reads past a query
// or fragment, so strip those first, then require the canonical shape
// https://www.tiktok.com/@<handle>/video/<id> (id digits only). A short link
// (vm.tiktok.com, vt.tiktok.com, tiktok.com/t/...) or a photo post (/photo/<id>)
// would fail the gate, so fail here instead, with the reason.
const parsed = JSON.parse(readFileSync(source, 'utf8'));
if (typeof parsed !== 'object' || parsed === null || typeof parsed.url !== 'string') {
  console.error('VIDEO.json must be a JSON object with a string "url" field');
  process.exit(1);
}
let videoUrl: string;
try {
  const u = new URL(parsed.url);
  u.search = '';
  u.hash = '';
  videoUrl = u.toString();
} catch {
  console.error(`VIDEO.json url is not a valid URL: ${parsed.url}`);
  process.exit(1);
}
if (!/^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+\/?$/.test(videoUrl)) {
  console.error(
    'VIDEO.json url must be a TikTok video address, https://www.tiktok.com/@<handle>/video/<id> (id digits only); ' +
      `got: ${parsed.url}`,
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

console.log(`Copied VIDEO.json (${videoUrl}) to ${target}`);
