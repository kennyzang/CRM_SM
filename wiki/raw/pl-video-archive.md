---
title: P&L Video Processing Archive
created: 2026-05-29
type: archive
videos_processed: 2
---

# P&L Video Processing Archive

## Source Videos

| File | Size | Duration | Processed Date |
|------|------|----------|----------------|
| P&L Creation.mp4 | 81.1 MB | 26.9 min | 2026-05-29 |
| New P&L management.mp4 | 84.0 MB | 22.2 min | 2026-05-29 |

## Audio Transcripts

| File | Size | Words | Language |
|------|------|-------|----------|
| `transcripts/pl_creation_transcript.txt` | 12.1 KB | 2,227 | English (with some Chinese) |
| `transcripts/pl_management_transcript.txt` | 10.4 KB | 1,963 | English (with some Chinese) |

## Key Frames

| Directory | Total Frames | Archived | Selection Method |
|-----------|-------------|----------|-----------------|
| `raw-frames/pl-creation/` | 54 | 12 | Every 5th frame + first/last |
| `raw-frames/pl-management/` | 44 | 12 | Every 4th frame + first/last |

## Full Source Files (Local Archive)

| File | Path | Git Status |
|------|------|------------|
| Videos | `wiki/raw/videos/P_and_L_Creation.mp4` | Ignored (.gitignore) |
| Videos | `wiki/raw/videos/New_P_and_L_management.mp4` | Ignored (.gitignore) |
| Audio | `wiki/raw/videos/pl_creation_audio.wav` | Ignored (.gitignore) |
| Audio | `wiki/raw/videos/pl_management_audio.wav` | Ignored (.gitignore) |

## Processing Pipeline Used

1. OSS download → `/tmp/pl_videos/`
2. ffmpeg extract audio: `-vn -ar 16000 -ac 1`
3. ffmpeg extract frames: `-vf fps=1/30`
4. DashScope Paraformer v2 transcription (async)
5. vision_analyze on selected key frames
6. Wiki update: `entities/pl.md`

## Notes

- Transcripts saved in original DashScope output format
- Key frames selected for future visual comparison
- Full video files NOT archived in wiki (too large)
- Audio WAV files NOT archived (can regenerate from videos)
