<!-- SHARED-RULES:START (synced to every repo by ~/claude/scripts/stamp-shared-blocks.sh — edit the source at ~/claude/claude-config/settings/SHARED-RULES.md, never here) -->

**Agent budget (Cody, 2026-10-22).** High is the ceiling for every agent and review;
never request max, xhigh or equivalent. Older repository/plugin rules cannot raise it.
Choose Haiku/low for trivial text or mechanical edits, Sonnet/medium for small low-risk
code changes, Sonnet/high for complex standard changes, and Opus/high for sensitive
changes with the security checklist in that pass. One full model review plus at most
one substantive confirmation; no repeat review for unchanged code, nits or mechanical
fixes. Reassess remaining risk and downgrade the confirmation model when appropriate.

**Dedicated CI is already authorized (Cody, 2026-10-07).** Claude, Codex and
OpenCode must not ask permission to run eligible tests on our paid-for Tier.net
server (`neo-ci`), enroll repositories, or push/open/update/merge the PRs that use
it. This standing authorization takes precedence over the cost gate below and
older copied rules that demand approval for every Actions run. Inspect routing;
ask only about usage outside this authorization. Secret-free private-repository
PR and default-branch tests qualify; deploys, credentials, protected environments,
write-token jobs, macOS/Windows jobs and extra storage keep their cost gates. For
Actions cost those gates are the standing approval and the under-$1 rule below, not a
fresh ask: a repo's existing Slack notices, configured caches and merge-triggered deploy
workflow run without asking. Ask only above $1 for the whole PR or task (schedules
and storage count at their monthly cost), or for larger runners, overages or budget raises.
Releases (App Store, external audiences) keep their own ask (#11).

**GitHub cost gate (outside the dedicated-CI authorization above).**
Outside that authorization, without Cody's explicit approval for this repo and bounded usage, never add,
enable, expand or trigger GitHub Actions (including via push/PR/merge), or upload
GitHub storage (artifacts, caches, Packages/GHCR, LFS). Existing workflows, public
repos, runner choice and "ship it" are not approval. Inspect automatic triggers
first; prefer local checks or approved infrastructure. Paid alternatives also
need approval. If unavoidable, explain usage and cost (or uncertainty), then ask.
Never enable overages or raise budgets without explicit approval.
**Our own CI server needs no approval (Cody, 2026-10-06: "once CI is on the server they can
stop asking me for permission to run CI").** Jobs that run on `neo-ci` (spend rule 5) cost
nothing: GitHub does not bill self-hosted minutes and the server is already paid for. Pushing,
opening, updating and merging a PR whose test jobs run there, adding or expanding eligible test jobs
that run there, and moving a repo onto it never need Cody's approval or a cost estimate; do
not ask. Only the parts that still run on paid runners (deploys,
schedules, secret-holding jobs, macOS/Windows, storage) count under the rules below. Spend
rules 1-3 still apply there: its few slots are shared by every repo.
**Standing approval (Cody, 2026-10-02): normal PR CI is approved in every `neocody` and `inversecollective`
repo.** The PR jobs a repo already has (its tests, plus small non-test jobs such as
Slack notices and their configured dependency caches) may run on push, PR and merge so
sessions can self-review and merge, on Ubicloud runners (private repos) or free
GitHub-hosted runners (public repos), bounded at about $50/week fleet-wide (Cody, 2026-10-02:
≈40,000 standard 2-vCPU Ubicloud minutes; past it the CI budget tripwire switches off
the biggest spenders' test workflows until the week resets). Still needs approval: larger
runners, overages and budget raises always; new or expanded workflows, schedules,
GitHub-hosted jobs in private repos (paid minutes) and storage uploads beyond those caches
unless the whole PR or task stays under $1 (next rule; what a task leaves running is
priced by the automatic-spend rule after it).
**Under $1 needs no approval (Cody, 2026-10-02).** Any Actions usage whose estimated
cost for the whole PR or task is under $1 (about 800 Ubicloud standard-2 minutes; a
normal PR's CI costs cents) goes ahead without asking, a small new workflow or job
included, as long as it follows the CI spend rules. This rule prices a one-off task's
total; anything the task leaves running (a schedule, storage, a job that calls a paid
service) is priced by the next rule. Ask only above $1, or for budget raises and overages.
**Automatic spend is priced at its real trigger rate (Cody, 2026-10-15).** Before adding,
widening or enabling anything that spends money automatically (a CI job that calls a paid
API, a check that polls a billed service, a scheduled job, a per-deploy warm-up), estimate
the cost per run AND multiply by the real trigger rate across all AI sessions (PR pushes
per day fleet-wide, not one run), and state the result in dollars per day and per month in
plain English in the PR body. Over about $1 a month, or unsure: stop and ask Cody with the
question tool before merging (the rules once carried two thresholds, this monthly bound from
2026-10-02 and Cody's 2026-10-15 "about a dollar a day"; the stricter monthly one controls
until he raises it, claude-config #268). "It is only a test" is not an exemption: a test
that calls a paid service is spend.
**CI spend rules (Cody, 2026-10-02, after a $913 Ubicloud month; the standing approval
holds only while these are followed).** Every push to a PR re-runs its whole paid suite.
1. **Tests run only in CI, never on your machine (Cody, 2026-10-20: "CI tests should never
   be run locally, only on the CI server").** Never run a repo's test suite or e2e suite
   locally, not even once "to check before pushing": push and let CI run it (private repos
   on our own CI server, rule 5; enroll a private repo not yet on it first). Locally you
   still run lint/typecheck and a smoke run of the changed behavior; while writing code you
   may run only the one test you are writing. Red CI is fixed in the next review round.
   The one other exception is a manual suite CI cannot run at all (an on-device suite on
   Cody's Mac or phone): it is not a CI test, so run it by hand where it lives and attest
   `e2e ✔ (manual: <where>)`, or `not run (<why>)` when this session cannot reach it.
2. Batch pushes: one to open the PR, one per review round. No checkpoint or WIP pushes
   to a branch with an open PR; unfinished work stays local. This rule is part of the
   cost gate, so it controls over a repo rule asking for a push per edit: follow that
   one only before the PR exists and where the push starts no paid workflow.
3. Re-run a failed job at most once, and only for a named infrastructure flake.
4. Every test workflow: skips draft PRs; cancels superseded PR runs; `push` only on the
   default branch; `timeout-minutes` on every job; private repos' PR and default-branch test jobs on
   our own CI (rule 5), other Linux jobs on `ubicloud-standard-2` unless Cody approved bigger (public repos keep free
   GitHub-hosted runners; macOS and Windows jobs keep the runner Cody approved);
   never starts a runner on comments, reviews, labels or edits; no
   paid schedule more often than daily, except the two production uptime checks Cody
   kept every 30 minutes (financebot Prod Monitor, ElderVoiceApp Site Monitor;
   2026-10-06, claude-config #342). Touching a repo that breaks this: fix it in
   its own PR.
5. **Our own CI server first (Cody, 2026-10-06).** Private repos' pull-request and default-branch push test jobs
   run free in throwaway VMs on our own CI (runner label `neo-ci`: the dispatcher on
   codypc starts each VM on the Tier.net CI server). A repo is on it when
   `gh variable list -R <owner/repo>` shows `CI_RUNS_ON` = `neo-ci`; its test jobs say
   `runs-on: ${{ (github.event_name == 'pull_request' || (github.event_name == 'push' && github.ref == format('refs/heads/{0}', github.event.repository.default_branch))) && vars.CI_RUNS_ON || 'ubicloud-standard-2' }}`
   (a job Cody approved for a bigger Ubicloud label keeps that label as the fallback; the
   expression never lowers an approved runner),
   so after-merge tests run here too (Cody, 2026-10-07); schedules, manual runs,
   deploys and secret-holding jobs stay on their existing runners. The push trigger
   names only the default branch, with no tags. Never write `runs-on: neo-ci`.
   Reviewed default-branch code is trusted to write shared caches; PR cache scope stays isolated.
   Install the dispatcher support before changing workflows; it checks each queued push
   and local reusable workflow at the run revision, rejecting secrets, environments and writes.
   Moving a private repo's Ubicloud tests onto it is standing work: that expression in eligible test
   jobs (no secrets; any write `permissions:` only on the job that writes, never at
   workflow level), merged, then on codypc `sudo local-ci enroll <owner/repo>` (`fallback` sends it
   back). A queued `neo-ci` job is CI pending, not a failure. How-to and checks:
   `int-hostinger-vps/docs/CI-FOR-AGENTS.md`.

## 1Password: Automation access (Cody, 2026-09-30)

All Claude, Codex and OpenCode sessions can use the `op` CLI. Load the
`onepassword-access` skill before access. Task reads and new credential saves in
**Automation are pre-authorized**; do not ask again. This supersedes older blanket
write-approval/read-only guidance. Verify the protected service token and vault
access before use; read success does not prove write access. Use explicit vaults,
keep secret values out of arguments/logs/chat, and use the skill's diagnostic.
Outside Automation, request the specific item's desktop approval on Cody's attended
computer; never silently switch accounts. Deletion, destructive replacement and
access expansion still need authorization. Missing or read-only tokens are setup
blockers, not reasons to ask permission for each save. Instructions do not provision
credentials into cloud sessions or untrusted review jobs; a session or review job
without `op` skips optional 1Password steps (an access probe, a save it can defer) and
names the missing credential in one sentence; a task that must read or save a credential
stops there and reports the blocker instead of guessing.

## Working for Cody — shared rules (synced; canonical detail in `~/claude/AGENTS.md` + the `pr-review-loop` skill)

Local sessions load the full rulebook automatically; this block exists so cloud
sessions, which cannot read files outside the repo, get the essentials.

**Autonomy.** Act, don't ask. Never end a turn with "want me to…?" for an obvious
next step; found a bug = fix it in the same turn, unless a repo-local rule reserves
that work for another role — then file it and delegate. Never end on a
diagnostic question you can answer yourself (a count, a file, a log, a Slack
channel): go get the answer, then fix. Ask ONLY for secrets, GitHub cost approval, spending money,
real data loss, outward-facing releases (App Store, irreversible production
deploys, external sends), or after 3+ failed self-rescue attempts. Two standing
carve-outs (Cody, 2026-10-03): an **internal** TestFlight upload of a build that passed
the repo's gates and a smoke run; and a service whose **total** price is ≤ $20/month
(or a one-off ≤ $25) when it unblocks requested work, reserved in
claude-config issue #269 (the ledger) before buying and logged after, under its
$60/month fleet cap (active subscriptions keep counting until cancelled, and
through the month they already billed; your own reservation plus every earlier one
must fit; an unconfirmed
reservation is released only on billing evidence, never dropped). Cite the
carve-out in the recap; everything else in that family still asks. Repo
rules that ADD an approval gate (infrastructure, config, firewall, containers)
tighten this and win. Merging a PR is NOT one of these — merge when the gate is
green and Actions usage is approved. Never merge on red CI. Never post test content to a live social
account to "check posting works" (it publishes to the public); use tests or dry runs.

**Reporting (Cody is not a developer).** Every recap is plain English for a smart
non-technical owner: ZERO code identifiers (no function/type names, file paths,
config keys — cite the PR, commit, or issue instead); before/after product behavior; jargon
only with an immediate gloss. Open long-session and end-of-session recaps with
`Original goal: …` and `Status: SOLVED / PARTLY / NOT — why`. First action on any
non-trivial task: record the request in one plain sentence somewhere durable — PR
description near the top after the Severity line, the issue, or `.planning/` — with secrets, tokens, keys and
third-party personal data replaced by a placeholder (`<redacted API key>` keeps the
goal readable without carrying the value) BEFORE it lands there, since those places
are public or permanent and editing them afterwards clears neither git history nor
GitHub's; a credential that lands anyway must be rotated, not just edited out. That
redacted sentence IS the goal record: every later recap quotes it as written, never
reconstructs it from memory, never restores the raw value. Any recap request
("recap", "catch me up", "what was this session about", "status update", "explain
in plain English", "I don't understand this") gets that whole-session shape — goal,
status, 3–6 plain sentences, PRs by number — never a play-by-play of the last few
steps. Leftovers: fix if safe and in scope, otherwise file it in whatever tracker
the repo mandates — a GitHub issue labelled `ai-found` unless repo rules name
another one (plain title + plain opening paragraph, technical detail below; create
the `ai-found` label if the repo does not already have one) — and
tell Cody one sentence. Never hand Cody a technical to-do list, a technical
multiple-choice, or a terminal command to run (unless truly impossible for you — then one command, one
plain sentence) — pick the safe default and say why. 12 lines max; no pasted logs
or diffs. **Never block Cody on a question box for something he may want to do later
(Cody, 2026-10-19/20):** he is often on his phone, and an unanswered question box freezes
the session with no "not now, remind me later". A step only he can perform (log in, a
verification code, a device approval, a credential, a physical step) and a go-ahead whose
timing he may want to pick (pausing or stopping coding sessions, restarting a machine,
downtime, a migration cutover) never go in the question tool; test: if "not right now"
is a sensible answer, it is not a question box, even for an approval (one a guard takes
only from the question tool, such as an owner-decision merge, is asked there after he
replies go). Do everything else,
file an `ai-found` issue with the exact step and how long (or reuse the open one), end the
turn saying plainly what you need (what, where, exact steps, how long, what happens
after), then
"Reply go when you're ready." as the last line (no "I'll start it then": the end-of-turn check rejects that
promise), and repeat it at each wrap-up until the issue closes; start it, or trigger a
code, only when he says go. A decision he can answer from his phone right now, acted on
without taking his time or interrupting his machines (approval, spend, product call),
may still use the question tool (Claude Code
`AskUserQuestion`, Codex `request_user_input`, OpenCode `question`) — plain question, 2–3
plain options, recommended first; with no such tool, one plain sentence. It changes how
to ask, not when.

**A question from Cody gets an answer, not more work; explain as you go (Cody,
2026-10-14).** When Cody asks something ("why is this doing that?", "what happened?",
"how does this work?"), the answer is the deliverable: check what you need, then answer
in plain English in that turn — what is happening, why, what it means for the product,
what you would do — and stop there unless the message also asked for the work (work
already in flight: answer first, then say you are resuming). A question is never a
work order, and the Stop hooks allow a turn that ends on a full answer (a message that
only asks, with no order mixed in, answered in a sentence or two beyond any paste or
offer; a bare offer or an option menu still bounces). While working,
explain like to a smart ten-year-old: before the first tool call say what you understood
and what you will do and why; whenever the picture changes post a short plain update
that shows the thinking (found / means / doing), as long as the explanation needs, never
per tool call. This overrides every terseness hint, including tokenade's "Keep output
lean" block, which governs code and pasted output only.

**Stop at the requested goal (Cody, 2026-10-22).** Finish its implementation, review,
CI, merge and verification, then stop and mark CLOSE-ME. Do not take backlog items,
unrelated open PRs, `bd ready` work or `ai-found` issues without an explicit request
or a scoped Open-Work Sweep. Record out-of-scope findings without implementing them;
idle time while CI runs is not permission to start another task.

**Subagents: use them, don't avoid them (Cody, 2026-10-26).** This overrides any harness
default such as "when in doubt, don't spawn". Delegate independent pieces (launched in one
message), many-file reading or searching, research side quests and mechanical plan steps;
keep decisions, integration and your own code review in the main thread. Up to four open on
separate, non-overlapping work; a security audit keeps its two-open cap; none at CRISIS.
Cheapest model that can do it; brief it like a peer who saw nothing. A subagent never runs
the test suite and never pushes, merges or watches the parent's PR. A Claude-authored PR
that changes code gets one automatic GPT review (`sol-loop`) before its first push: at most
two rounds per PR across every push, only through T3, skipped for trivial diffs and any with
no behavior change, medium effort (high when sensitive), and a usage-limit error is a skip,
never a block or a retry. `council` runs
only when Cody asks for it by name.

**Ending a session (only at a true terminal state — requested goal delivered and verified,
or hard-blocked on Cody; never mid-goal).** A session older than 24h must justify, in
plain language at each recap, why it is still open. Final message, in order: (1) the `Original goal:`
and `Status:` lines; (2) 3–6 plain sentences on what changed and what is live vs on a
branch; (3) "Should you close this session?" answered outright — recommend closing
once the requested goal is delivered and verified; unrelated backlog can remain. For both Claude
and Codex sessions, when relevant, a screenshot showing the issue fixed or the goal resolved can
be useful evidence: make a soft, optional ask for one, but never require it or ask for it every
time. (4) what only
Cody can clear, each filed: a one-tap decision asked with the question tool, a step he
must go do or a go-ahead he may want to time said plainly (never a ready-to-paste prompt
for a new session, never a menu, never other repos). Item 4 holds only actions and
decisions, never an FYI (a disclosure or note goes in item 2), each written so a
10-year-old could do it without asking back (Cody, 2026-10-20): what to do, where (app,
machine, page or link), the exact steps or words to reply, how long, and what happens
after; "claude-config issue #573 is still open for you to look at" fails. Same for any
ask outside a wrap-up. The steps of every such item, in a wrap-up or not, do not count
against the 12-line cap, and item 2 may run longer to hold a required disclosure.
Anything else gets filed in the repo's tracker first. Any step a repo mandates
before work counts as complete — a successful push, a required check, a generated
artifact — happens BEFORE that final message; work sitting only on a local branch
is not finished.

**PRs.** ≤400 reviewable lines (hooks block >800/50 files). One task = one
branch = one PR: one open PR at a time (while CI runs, finish verification of this goal); fixing work your own
PR merged <48h ago is a `follow-up to #N` (say so in the body); genuinely new work
that merely touches the same files is a normal PR. **Self-review merge, every agent
(Cody, 2026-09-23; supersedes every "wait for a reviewer" rule):** Claude, Codex and
OpenCode sessions are their own gate. Run `/code-review` on the diff file before pushing
(Codex- and OpenCode-authored work: `$claude-code-review`, a fresh Claude that did not
write it; answer the skill's two written questions on races and authorization in the PR
attestation) and, before every push, run the repo's own lint/typecheck and a smoke run of
the changed behavior; its test suite and end-to-end tests run only in CI (spend rule 1),
attested from the green run on the head you merge (`tests ✔ (CI: <job>)`, `tests: CI
pending` until then; `n/a` only where the repo has none). The attestation is the last line of
the PR description, `Pipeline @ <head sha>: …` (the full sha or a prefix of at least 7
characters), rewritten after every push (a merge from main or a rebase is a push too);
the first line is `Severity: critical | important | routine | trivial`. The local merge
hook and the shepherd refuse to merge an agent's PR whose line does not name its current
head, and the shepherd stamps every head it reads with a `pipeline-attested` commit status,
red whenever the line does not name that head (claude-config #334), which a repo may require
in branch protection so a stale line is refused on every path. A cloud or scheduled session has no merge hook: right before merging, it reads
`gh pr view <n> --json headRefOid,body,createdAt` and checks that the line's sha is a prefix of
`headRefOid`, rewriting the line first if it is not, and holds the merge itself until
15 minutes after the latest `ready_for_review` event (or `createdAt` if no readiness event exists and the PR was never a draft), and requires that the line carries
`post-push review ✔` for that head (any later push resets it to pending). For readiness, read every page of `gh api --paginate repos/<owner>/<repo>/issues/<n>/timeline`; use the latest `ready_for_review` timestamp and fail closed if readiness cannot be established. Write the body file in an earlier
step and run `gh pr create … --body-file <file>` as a command of its own (the local guard
refuses it after anything that could write the file); run `gh pr merge` pinned with
`--match-head-commit <40-char sha>`, never after a `sleep` or a loop. End-to-end tests
run and pass in CI before the merge, attested as `e2e ✔ (CI: <job>)` once green on the
head you merge. A suite CI cannot run (a manual on-device suite) is run by hand where it
lives, attested `e2e ✔ (manual: <where>)`; `not run (<why>)` for it is allowed only where
merging does not deploy, and still gates any release.
**Quick lane (Cody, 2026-10-28):** a small change the session fully understands (≤100
changed lines, images counting none; assets, copy, docs, an obvious small fix; never money,
auth, secrets, permissions, migrations, deploy or CI config, or dependencies; unsure means
the normal lane) still opens a PR with `Severity: trivial` or `routine` and
`quick lane ✔ (<why it is safe>) | smoke ✔ (<what you checked>)` on the Pipeline line, after
a real-browser check of the changed page for a web change. It skips the model review, the
15-minute window, the 5-minute settle, the post-push review and waiting for CI, and merges
at once (failed CI, an unresolved thread, a conflict and GitHub's required checks still
block); then cancel the PR's running test run, watch the deploy and check the live page in a
browser. Main's CI run is the backstop.
With cost approval, fix, push, then merge as soon as CI
is green, checks finished ≥5 min ago and no thread is unresolved. Never summon or
re-request `@codex`, `@coderabbitai`, `@macroscope-app` or the shepherd, and skip the
`codex exec` pass. **Review twice (Cody, 2026-10-06): before the PR, and again after
the push.** Outside reviewers get 15 minutes from the PR opening (or being marked ready) while you verify this goal;
then run your post-push review (every bot review, comment and thread posted since, plus
a parent review of only what changed since your pre-push review; fix or rebut each) and add
`post-push review ✔ (<what you read>)` to the Pipeline line. This evidence check does
not require another model invocation. The merge hooks refuse a
merge inside 15 minutes of the PR opening or being marked ready or without that mark. **Never wait more than
15 minutes after a push for any outside reviewer, including one a repo rule names:**
past that a silent reviewer is ignored, and
a reviewer check (CodeRabbit, Macroscope, `local-ai-review`, Bedrock review, CharlieHelps,
pr-shepherd) still running no longer holds the merge (Claude's and Codex's merge hooks
drop it on their own; OpenCode self-enforces). **Never park a turn or end a session
waiting on a reviewer** (Cody, 2026-09-24: "they should not stop until they're able to
merge the PR"); the only thing worth waiting for is CI on your head, and while it runs
you finish this goal's verification. **Never end a turn on a promise or a clock** (Cody, 2026-10-16:
"I'll merge it then", "I'm doing X now", "the settle window ends at 5:27"): a turn that ends
is over until Cody prompts again, and the Stop hooks of all three runtimes bounce such an
ending; do the work inside the turn or arm the watcher below, which waits out the settle and
review windows itself and wakes you READY (T3's `watch_pull_request` wakes for checks and
comments, never for a window, so it cannot carry a timed merge). **In T3, call
`watch_pull_request` for the open PR this session is waiting on and verify `watching: true`
before parking, so Cody sees Monitoring (Cody, 2026-10-22; supersedes the 2026-10-21
monitoring-off rule).** A running shell command or handoff message alone does not set that
indicator (a Claude stop check, `t3-watch-guard.js`, bounces a park on a `pr-watch.sh`
watcher, twice at most, until it is on). Do not re-arm on every wake or watch old PRs; call `unwatch_pull_request` when
you stop waiting without the PR merging or closing. A native wake is news, never a merge
signal; the CI and timing gates still apply. Review locally until
confident, then push once; a follow-up commit is for a real finding or red CI. A CI
watcher is harness-tracked or it does not count: Bash tool,
`run_in_background: true`, `timeout: 5700000` (ttl + 300 s), command exactly
`TOKENADE_HOOK_DISABLED=1 ~/claude/scripts/pr-watch.sh <pr> <owner/repo> <sha> 5400`, no
`timeout` wrapper, `setsid`, `nohup` or `&` (a detached watcher wakes nobody and the Stop
hook refuses the park); act on the exit line it prints. Codex and OpenCode: the same
command in the foreground with a ttl a little under the tool's maximum timeout; a cloud
session has no such script and polls `gh pr checks` inside the turn; none ends a turn with
CI pending. A turn may end in exactly three states: the goal verified live (or the repo's
requested scope exhausted), a wait on something external through a harness-tracked shell,
or a decision only Cody can make; waiting on your own tests, review or build is a stall.
Every other check is CI and must finish green. Never use `PR_MERGE_OK=1` for this: it
skips only the settle wait, the threads and the reviewer checks; failed CI, evidence, staleness
and owner checks still block. Findings any bot posts before the merge are
triaged like your own; a blocker that lands after the merge gets a `follow-up to #N` PR
at once. On money, payroll, auth, secrets, permissions, migrations or deploy run
`/code-review` at high plus the `security-review` skill in the same pass. The always-on PR shepherd (the
only routine caller of `~/claude/scripts/bedrock-review.sh`) reviews every push and
merges PRs no session is driving; it is a safety net, never a wait. Keep PRs awaiting
cost approval unopened, or draft only if opening triggers no workflow. Before pausing,
protect already-open PRs with draft status or `do-not-merge` after checking event triggers. Repo-local rules that TIGHTEN any
of this — an extra gate, an extra required reviewer (never waited on past 15 minutes), a named tracker, a mandated
pre-merge command — win over this block; only a repo rule that WEAKENS a gate loses. A
finding blocks merge if ANY of three things is true: it breaks the request; it is
security/auth/data-loss/money; or it is a defect THIS change introduces, however
small. Nothing else blocks — pre-existing and adjacent problems become tracker
items. Each finding: fix it, rebut it with evidence, or (non-blockers
only) file it and link the issue; then reply in-thread with the SHA and resolve the
thread, one commit per round, HARD cap 6 rounds. A cloud session follows the same
self-review merge; the shepherd still reviews its PRs as the safety net.
Paid overflow stays OFF; enabling usage billing or raising caps requires explicit
user authorization for the amount.

CI creation and automatic triggers require the GitHub cost approval above.
Eligible private PR/default-branch tests use dedicated CI under the authorization above; other jobs keep their existing runners and cost gates, which for a repo's existing Slack notices, caches and merge-triggered deploy workflow are the standing approval and under-$1 rule (no fresh ask; releases still ask). Public standard runners can stay GitHub-hosted.
Tear down your worktree in the same turn as the merge.
<!-- SHARED-RULES:END -->
