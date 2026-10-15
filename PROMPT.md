# Local Park Map

## Prerequisites

Create a git repository and set it up to use the github repository `notmike101/2026-10-15-granicus-parks`.

First, create a scaffolding commit to establish the baseline for the repository. You are not to write any code for this, just commit what we have and push.

## Conventions

* You must work in feature branches off of `main` and are not permitted to merge automatically. You may use isolated worktrees as needed, but those must live in a subdirectory under this project `.worktrees`. You may use `.gitignore` as necessary to ensure these are not committed.
* You must commit using the agent identity `agent-notmike101[bot]`.
* You must create meaningful conventional commit messages explaining your change in declarative format.
* You must create meaningful tests based on the overarching specification and the acceptance criteria for the relevant milestone. Tests must validate the specified behavior rather than merely confirm the implementation.
* You must write any documentation in ASD-STE100 standard, you can use the `asd-ste100` skill to help you with this.
* If you need to deviate from the specification, you must clearly explain why and how your alternative is a more realistic and better approach within your PR. Your PR must also explain how your changes meet the required specification in plain english. Do not create a PR for every small change, your PR must be focused on a major milestone. I do not have time to review an abundance of PRs.
* Use must use the ponytail skill set to ensure that you are not overengineer and producing the minimal possible code to meet the requirements.
* Any temporary files must be put in a `.scratch` directory and ignored or deleted.

## Delegation

You may use subagent delegation as needed to complete the assignment.

### Delegation Restrictions

You are only permitted to use a single `llama.cpp` provider subagent at a time, this provider is not able to handle more than one request at any given moment. For any other provider, use as many subagents as necessary to complete the task.

For any major architectural decisions, please use the ask tool to request feedback from me. I would appreciate knowing what you recommend for each decision, the benefits, and the tradeoffs of each potential decision that you recommend.

## Planning

Use the superpowers skill set to create an overarching plan and specification, broken up by reasonable milestones. You do not need to create a plan for each branch, but each branch must be focused on a specific milestone. After the initial planning phase, use superpowers only when necessary.

## Task

We need to build a map of the parks found in `parks.sample.json`. Selecting a park should open an overlay showing its details and any relevant links, images, assets, name, address, description, etc. Preferably, all relevant content to the user should be available.

Users should be able to find, filter, and select parks without using an interactive map.

The application must function without geolocation permissions or access to the user's current location. The initial map viewport should accommodate the supplied park locations.

The overlay can be a modal or a simple popover, depending on accessibility needs.

The application interface should work on a reasonable modern mobile device, tablet, and desktop screen regardless of resolution, operating system or browser. You do not need to support every possible resolution or browsers you do not have access to, but you should implement reasonable responsive design practices and flow behavior.

You must conform to WCAG 2.1 AA (https://www.w3.org/TR/WCAG21/) as best as reasonably possible, including readable text and clear labels, alternative interactions, consideration for screen readers and keyboard-only navigation.

## Data

Use the supplied `assets/parks.sample.json` as the baseline. You may extend extend the schema, add new locations, and use another public dataset as necessary for more robust data and a better presentation for a demonstration of your work.

The sample includes missing and empty values, so you must consider how fallback or missing data is rendered. Preferably, a missing image should result in a standardized missing image fallback and missing text content is not rendered with a fallback.

## Technology Stack

You must use the following technology stack as a baseline:
* Vite
* Vitest
* notmike101/eslint-configs (Specifically `eslint-config-js` and `eslint-config-jsdoc` from https://github.com/notmike101/eslint-configs)

You are expected to use vanilla JavaScript and standardized web components where necessary. You are not permitted to use React, Vue, or any other frontend framework.

You are permitted to choose any mapping SDK that allows you to implement this, but chosen client library must be minimal and reasonable. I recommend Leaflet or MapLibre as part of the decision, but I will let you choose the specific provider if one fits better. Any additional technologies must be approved by me as part of the spec drafting phase.

## UI/UX Design

You are permitted to come up with a reasonable design using modern web standards and UI/UX practices. You may create a focused research milestone for explorint different potential UI/UX patterns for this type of interface from competing websites across the internet. Your findings and recommendation should be documented for review before any design decisions are comitted to.

## Documentation

You must fully comply with the ESLint rules and set it up with `--max-warnings 0` as part of your linting process.

You must create a detailed README other relevant documentation explaining your implementation and the parks schema. If you decide to deviate from the sample specification, you must do so in the README file.

Do not use the README file for all of the documentation, keep it light and explain things at a high level. More detailed and lower-level documentation must be kept under a `docs` folder, logically separated by subject.

Any documentation MUST be written in ASD-STE100 standard, you can use the `asd-ste100` skill to help you with this.

## Verification

Test the built application in an actual browser. Verify all documented functional according the specification, including, but not limited to: park selection from both the map and list, keyboard navigation, visible focus states, responsive layout, and missing-data handling.

Document which tests passed, which failed, and which could not be performed. Do not claim accessibility compliance solely because automated tests pass. Distinguish tested behavior from assumptions.

## Code Review

After each milestone, create a PR to merge your feature branch into `main` and I will review the PR myself. Once I approve the PR, it will be merged into `main` by myself and I will inform you when the PR is merged.

You are expected to continue working in other branches while a PR is pending review, but if something is blocking forward progress, then you must clearly and plainly state the blocker and what is necessary to unblock you.

## Git Identity

`git` and `gh` on PATH are agent-identity shims stored in `D:\github-agent\bin`. Plain `gh` binary acts as a personal identity that should not be used without explicit authorization.

Run every `gh` command that must act as `agent-notmike101[bot]` through the identity helper directly, with the repo scoped before the command word: `PATH="/c/Program Files/Git/cmd:$PATH" node D:/github-agent/identity.mjs --repo notmike101/2026-10-15-granicus-parks gh <args>`

The PATH prepend is required: gh's internal git subprocesses must resolve the real Git binary, not the shim, or gh fails with "batch file arguments are invalid".

Write commit messages to a file and use `git commit -F <file>`. Multi-line or bracketed `-m` messages break the shim's argument passing.

After you create a PR, you must verify PR authorship after creation shows `app/agent-notmike101`, not `notmike101` personal identity. You can do this with the command: `gh pr list --repo notmike101/2026-10-15-granicus-parks --json number,author`

## Time Requirement

Complete implementation, automated testing, and initial documentation within 75 minutes of starting execution. Prioritize core requirements. Reserve the remaining assessment time for human code review, and manual validation.

When the execution deadline is reached, stop implementing new features and finish the active task. Preserve the current working state, execute any remaining feasible verification, and document incomplete requirements. Do not sacrifice working core functionality to complete optional features.

## Transcript Requirement

Preserve complete, unmodified transcripts from every session and subagent involved in this task, including prompts, responses, and tool activity where available. Make them available for final submission. Do not summarize, redact, or selectively omit interactions. Do not expose credentials or confidential information to the agents.
