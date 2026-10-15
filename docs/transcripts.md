# Session Transcripts

This task used three OMP sessions and several subagents. Each session keeps a
complete rollout file: every prompt, response, and tool call in order. Nothing
is summarized or cut.

## Location

The files live in `.session-logs/transcripts/` in the working copy.
The directory is ignored by Git on purpose. A rollout records local paths and
one session credential, so the repository must not publish these files. Use
the local copy for review or submission.

`.session-logs/transcripts/index.json` lists every file with its byte count and
a SHA-256 prefix. Copy the directory as it is, then check the digests.

## Files

| File | Bytes | Content |
| --- | --- | --- |
| `2026-10-15T15-58-11-990Z_01a14049…_01a14049-0e17-7000-8aef-f53b9266a601.jsonl` | 438,407 | Session 1: planning, specification, and the toolchain milestone. |
| `…01a14049…/__advisor.jsonl` | 300,236 | Advisor subagent for session 1. |
| `2026-10-15T16-40-45-565Z_01a14070…_01a14070-04fd-7000-9f3a-c9baf9a14afb.jsonl` | 890,792 | Session 2: data catalog and map milestones, plus the first review fixes. |
| `2026-10-15T17-57-13-544Z_01a140b6…_01a140b6-06c8-7000-a4db-b12cb00d54e0.jsonl` | 2,656,104 | Session 3: integration, documentation, responsive fixes, and the four follow-up fixes. |
| `…01a140b6…/Catalog.jsonl` | 737,931 | Catalog subagent transcript. |
| `…01a140b6…/Mapmilestone.jsonl` | 688,040 | Map subagent transcript. |
| `…01a140b6…/DocsResponsive.jsonl` | 768,976 | Documentation and responsive subagent transcript. |
| `…/<n>.bash.log`, `…/<n>.read.log`, `…/<name>.md` | 0.5-25 kB each | Large tool output spilled to a file, and short subagent notes. |

The total is 6.60 MB across 24 files, measured when the copy was made.
The last session was still open at that moment, so its file grows until the
session ends. `index.json` holds the authoritative size and digest for each
file.

The harness also keeps two databases: `~/.omp/agent/history.db` holds a
searchable prompt history, and `~/.omp/agent/agent.db` holds live session
metadata. Both are outside the repository.

## Coverage note

The milestone subagents for the toolchain, data catalog, map, and integration
branches have no separate rollout file. Their prompts and returned results
appear inside the rollout of the session that started them. Search the session
file for the branch name, for example `m2-data-catalog`, to find each
delegation and its result.
