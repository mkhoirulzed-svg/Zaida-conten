# ZAIDA Smart Timeline — prototype notes

## Current milestone

This branch adds a browser-only proof of concept at `smart-timeline.html`.

It accepts:
- One narration audio file.
- Multiple image files.
- A script divided into idea paragraphs (blank line = scene).
- Optional sentence-level mode: each sentence becomes an individual scene.
- A local Smart Scene Planner that assigns a scene role (hook, anatomy/mechanism, symptom, warning, action, comparison, follow-up, or closing), a subject suggestion, shot type, visual direction, and an editable illustration prompt. These are transparent keyword heuristics, not AI-generated scene understanding.

It allocates the audio duration across idea paragraphs in proportion to word count, assigns uploaded images in order (reusing images if there are fewer images than scenes), allows per-scene duration edits, provides editable scene role context, shot type, visual-direction notes and illustration prompts, and exports all of those fields in storyboard JSON, previews the visual sequence with animated camera movement (zoom/pan) against audio playback, and attempts a browser WebM export using Canvas `captureStream()`, HTMLAudioElement `captureStream()`, and MediaRecorder. After a WebM export, the user can optionally convert that in-memory result to MP4 using Mediabunny and WebCodecs; Mediabunny is dynamically loaded on first use from esm.sh and processes the video locally in the browser.

## Explicit limitations

This is deliberately not presented as full NarraCut parity:
- Sentence-level splitting is rule-based punctuation parsing; it does not yet understand context, abbreviations, or whether two sentences should share one visual.
- Scene roles, shot types, visual directions, and illustration prompts use local keyword rules. They are editable production guidance, not semantic AI scene detection; no image generation is wired yet.
- Timing is estimated from word counts; it is not forced alignment or word-level synchronization.
- Image matching is sequential, not vision/embedding-based. Shot type and visual-direction suggestions are heuristic and must be reviewed by the user.
- Camera movement is currently a simple preset animation (not true 3D camera movement or AI-generated motion). Storyboard JSON is an interchange/export artifact only; cloud project saving and automatic image generation are not implemented.
- WebM export and MP4 conversion both depend on browser support. MP4 conversion uses Mediabunny (MPL-2.0) with AVC/H.264 and AAC encoders exposed by WebCodecs; unsupported codecs or devices will produce a clear conversion error. Mediabunny is loaded from a CDN on first use, but the video file itself is not uploaded.
- The export path has not yet been verified on the user's Chromebook. Treat it as an experimental browser feature.

## Next engineering milestones

1. Test upload, preview, and WebM export in ChromeOS Chrome.
2. Verify WebM-to-MP4 conversion on ChromeOS Chrome, including audio sync, duration, file size, and codec support.\n3. Add an optional AI scene-planner adapter that groups transcript spans by meaning and emits validated scene JSON, while retaining the local planner as a no-key fallback.
4. Add a transcription/forced-alignment adapter that returns word timestamps.
5. Add image semantic matching and manual reassignment.
6. Add Cloudflare Worker API endpoints and secure provider-secret configuration.
7. Decide on a cloud MP4 renderer only if local browser conversion proves insufficient.

## Device constraints

Keep the browser page lightweight. Do not run Whisper, FFmpeg, Python, Docker, Remotion rendering, or local vision models on the Chromebook. Use remote APIs only when configured and keep rendering optional.
