# ZAIDA Smart Timeline — prototype notes

## Current milestone

This branch adds a browser-only proof of concept at `smart-timeline.html`.

It accepts:
- One narration audio file.
- Multiple image files.
- A script divided into idea paragraphs (blank line = scene).
- Optional sentence-level mode: each sentence becomes an individual scene.
- Rule-based visual direction hints for common health/explainer topics; these are suggestions, not AI-generated scene understanding.

It allocates the audio duration across idea paragraphs in proportion to word count, assigns uploaded images in order (reusing images if there are fewer images than scenes), allows per-scene duration edits, provides editable shot type and visual-direction notes, exports a storyboard JSON file, previews the visual sequence against audio playback, and attempts a browser WebM export using Canvas `captureStream()`, HTMLAudioElement `captureStream()`, and MediaRecorder.

## Explicit limitations

This is deliberately not presented as full NarraCut parity:
- Sentence-level splitting is rule-based punctuation parsing; it does not yet understand context, abbreviations, or whether two sentences should share one visual.
- Visual direction hints use simple keyword rules; no semantic AI scene detection or image generation is wired yet.
- Timing is estimated from word counts; it is not forced alignment or word-level synchronization.
- Image matching is sequential, not vision/embedding-based. Shot type and visual-direction suggestions are heuristic and must be reviewed by the user.
- Storyboard JSON is an interchange/export artifact only; cloud project saving and automatic image generation are not implemented.
- Export is WebM, not MP4. Browser codec and audio capture support vary.
- The export path has not yet been verified on the user's Chromebook. Treat it as an experimental browser feature.

## Next engineering milestones

1. Test upload, preview, and WebM export in ChromeOS Chrome.
2. Replace heuristic sentence splitting with an AI scene planner that groups transcript spans by meaning and emits validated scene JSON.
3. Add a transcription/forced-alignment adapter that returns word timestamps.
4. Add image semantic matching and manual reassignment.
5. Add Cloudflare Worker API endpoints and secure provider-secret configuration.
6. Decide on a cloud MP4 renderer only after measuring the prototype and budget.

## Device constraints

Keep the browser page lightweight. Do not run Whisper, FFmpeg, Python, Docker, Remotion rendering, or local vision models on the Chromebook. Use remote APIs only when configured and keep rendering optional.
