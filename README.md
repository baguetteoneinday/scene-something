# Between

**사진과 사진 사이의 이야기를 기록하다.**

React 19, TypeScript, Next.js 16 App Router API, Tailwind 4, OpenAI official JS SDK + Responses API. Sites hosting uses Vinext's App Router compatibility build on Cloudflare Workers with Node compatibility. The bundled `next` dependency is retained; the hosting production artifact is the Vinext Worker build, not a Vercel deployment.

## Run locally

Node.js 22.13+ and npm required.

```sh
npm ci
cp .env.example .env
# Add OPENAI_API_KEY to .env (never NEXT_PUBLIC_OPENAI_API_KEY)
npm run dev
```

Open the printed local URL. Demo works without credentials. Configure `OPENAI_MODEL` to change the model in one place. Default `gpt-5.4-mini` supports image input, Responses and Structured Outputs: https://developers.openai.com/api/docs/models/gpt-5.4-mini . SDK schema reference: https://developers.openai.com/api/docs/guides/structured-outputs . Runtime secrets must be configured separately for deployed Sites; `.env` is excluded from Git and archives.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm start` serves the production Worker locally. Production bindings receive OPENAI_API_KEY as a secret and OPENAI_MODEL as a runtime variable. Changing deployed secrets requires redeployment. No browser API key input exists.

## Routes and responsibilities

- `/`, `/upload`, `/analysis`, `/context`, `/style`, `/story`: shared session provider across navigation.
- `context/StorySessionContext.tsx`: reducer, session state and object URL cleanup.
- `components/between/BetweenApp.tsx`: screen components and accessible interactions.
- `lib/images/compress.ts`: image optimization, EXIF capture date, stable/manual order.
- `lib/openai/`: server-only client/config, distinct prompts, Zod schemas, bounded body parsing, safe error mapping, Responses Structured Outputs parsing.
- `lib/demo/demoData.ts`: independent demo data, 20 visible type/tone combinations and local deterministic generator.
- `public/demo/`: replaceable image assets and license credits.

## API flow

1. `POST /api/analyze` accepts a multipart form with metadata and optimized images. All 3–20 images go to a single multimodal Responses request; IDs and order are checked on input and output.
2. `POST /api/questions` receives the validated analysis and returns 0–5 questions.
3. `POST /api/story` receives analysis, user answers, format and tone. Subsequent generations reuse the original analysis and answers.

Every request uses `store: false`. Server-only modules prevent client imports. The SDK timeout is 180 seconds, with SDK automatic retries disabled. No image/answer/story logging, persistent database or server disk storage. `store:false` controls response storage; provider abuse-monitoring retention is subject to OpenAI account policies.

Images: JPEG, PNG, WebP, original up to 30MB each; sequential browser optimization to at most 1600px long edge, adaptive JPEG quality/downscale, target <=210KB. At most 20 copies fit below the 5MB API body limit. Server validates MIME, image magic bytes, counts, unique IDs, order and byte bounds. JSON endpoints stream-limit the body to 300KB before parsing. React text nodes render all content; never raw HTML. Original images remain object URLs in the browser. Refresh starts a new session.

The creativity control (0, 25, 50, 75, 100) governs permission to invent in every format, not an exact factual percentage. Zero uses verified observations and user answers only. Nonzero results and copied text disclose creative reconstruction. Tone guides use essay, fiction, cinema and poetry techniques; no specific author imitation. Factual fidelity remains prompt-based.

Chapter planning is deterministic: preserve user order, split at an absolute gap of at least one hour between known capture timestamps, at scene changes, or after three photos. Missing timestamps do not establish elapsed time. At least three chapters are planned, up to twenty. Structured output requires one section per plan entry; the server assigns its exact photo IDs. Each body has a minimum of 360 characters (260 for ten or more chapters). The UI gallery reads intrinsic dimensions, aligns row heights without cropping, and stacks images on phones.

## Demo and validation

Demo branches before any API call, uses local photographs and deterministic prose, and supports typed context, five formats, four tones, regenerate, copy and reset. Photographs are independent sample images, not documentary evidence of one trip. Credits are in `public/demo/CREDITS.md`.

Tests cover every demo combination, schema bounds, valid photo references, empty answers, original user text, EXIF completeness and manual-order precedence. Browser QA includes demo end-to-end, Memory/Story modes, mobile layout, copy, file selection, limits, reorder/delete and error recovery. Live analysis, questions and story generation have been verified with the configured server key. The chapter upgrade produced three hourly chapters totaling 1,245 Korean characters in a live generation test. No mock API handler is used.

## Submission

Sites starts with owner-only access. A hackathon URL must have its audience changed to public or have judges added before submission; deploying privately alone does not grant judges access. Configure the OpenAI secret and complete one real-photo run before treating the production AI flow as verified.
