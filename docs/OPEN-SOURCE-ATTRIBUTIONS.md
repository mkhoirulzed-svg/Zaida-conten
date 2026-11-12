# Open-source references and attribution

ZAIDA Smart Timeline is an independent implementation informed by the workflows and public documentation of these projects. It does not vendor or copy their source code in this first browser prototype.

## Beatsheet — Richadaf/faceless-youtube-video
- Repository: https://github.com/Richadaf/faceless-youtube-video
- License: MIT (verified in the repository README).
- Relevant idea: narration audio → word timestamps → beat cue sheet → image frames → timed slideshow.
- ZAIDA adaptation: idea-based scenes, image timeline, narration-led timing, browser-first workflow.
- If source code is copied or adapted in a future milestone, retain the MIT copyright and permission notice and document the exact files.

## ScriptSmith-Engine — TheUnknown550/ScriptSmith-Engine
- Repository: https://github.com/TheUnknown550/ScriptSmith-Engine
- License: MIT (verified from LICENSE).
- Relevant idea: script/TTS → timestamped transcript → AI scene plan → scene images → assembled video.
- ZAIDA adaptation: modular pipeline boundaries and independently rerunnable stages.
- If source code is copied or adapted in a future milestone, retain the MIT copyright and permission notice and document the exact files.

## OpenCut-AI — dvreno/OpenCut-AI
- Repository: https://github.com/dvreno/OpenCut-AI
- The repository README identifies it as a fork of OpenCut and declares MIT; verify upstream notices and individual dependency/model licenses before incorporating code.
- Relevant idea: transcript-aware media matching and timeline editing.
- ZAIDA adaptation: future reference for visual matching and manual timeline correction.
- No OpenCut-AI source code is included in this prototype.

## General rule

Do not copy whole repositories wholesale. Before incorporating any upstream source, inspect its exact license, notices, dependencies, model terms, security posture, and compatibility with Cloudflare/browser hosting. Keep attribution files with adapted code.
