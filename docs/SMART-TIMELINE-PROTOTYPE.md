# ZAIDA Smart Timeline — prototype notes

## Current milestone

This branch adds a browser-only proof of concept at `smart-timeline.html`.

It accepts:
- One narration audio file.
- Multiple image files.
- A script divided into idea paragraphs (blank line = scene).

It allocates the audio duration across idea paragraphs in proportion to word count, assigns uploaded images in order (reusing images if there are fewer images than scenes), allows per-scene duration edits, previews the visual sequence against audio playback, and attempts a browser WebM export using Canvas `captureStream()`, HTMLAudioElement `captureStream()`, and MediaRecorder.

## Explicit limitations

This is deliberately not presented as full NarraCut parity:
- Scene grouping is supplied by the user through paragraph breaks; no semantic AI scene detection is wired yet.
- Timing is estimated from word counts; it is not forced alignment or word-level synchronization.
- Image matching is sequential, not vision/embedding-based.
- Export is WebM, not MP4. Browser codec and audio capture support vary.
- The export path has not yet been verified on the user's Chromebook. Treat it as an experimental browser feature.

## Next engineering milestones

1. Test upload, preview, and WebM export in ChromeOS Chrome.
2. Add a transcription/forced-alignment adapter that returns word timestamps.
3. Add an AI scene planner that groups transcript spans by meaning and emits validated scene JSON.
4. Add image semantic matching and manual reassignment.
5. Add Cloudflare Worker API endpoints and secure provider-secret configuration.
6. Decide on a cloud MP4 renderer only after measuring the prototype and budget.

## Device constraints

Keep the browser page lightweight. Do not run Whisper, FFmpeg, Python, Docker, Remotion rendering, or local vision models on the Chromebook. Use remote APIs only when configured and keep rendering optional.
