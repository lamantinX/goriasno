# Plan 020: Enforce personal-data consent server-side on /api/leads

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b1ac6d3..HEAD -- server.js src/components/Modal.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (independent of 019, but both edit `Modal.tsx` — see Maintenance)
- **Category**: security
- **Planned at**: commit `b1ac6d3`, 2026-06-30

## Why this matters

Russian law FZ-152 requires explicit, recorded consent to process personal data
(name + phone) before a lead is accepted. Today the consent checkbox is enforced
**only in the browser** (`Modal.tsx` disables the submit button until `agree` is
true), but the client never sends a consent flag and the server
(`POST /api/leads`) never checks one. Anyone hitting the API directly — curl,
bot, replay — submits a lead with no consent, and the business has no
server-side record that consent was given. This plan makes the client send
`consent: true` and the server reject any request where `consent !== true`.

Note: **rate-limiting already exists** (`server.js:38`, `express-rate-limit`,
5 req/min) — this plan does NOT touch it.

## Current state

- `server.js` — Express lead endpoint. Validates `name`, `phone`, `productName`,
  `message`, `sourceForm`, but has **no consent check**. Relevant excerpt:

  ```js
  // server.js:46-64
  app.post('/api/leads', leadLimiter, async (req, res) => {
    try {
      const { name, phone, productName, message, sourceForm } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return res.status(400).json({ success: false, error: 'Invalid name' });
      }
      if (!phone || typeof phone !== 'string' || phone.length < 7 || phone.length > 20) {
        return res.status(400).json({ success: false, error: 'Invalid phone' });
      }
      // ... productName / message / sourceForm checks ...
  ```

- `src/components/Modal.tsx` — builds the POST body; **does not include
  consent**. Relevant excerpt:

  ```tsx
  // src/components/Modal.tsx:86-96
  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: submission.name,
      phone: submission.phone,
      productName: submission.productName,
      message: submission.message,
      sourceForm: submission.sourceForm,
    })
  })
  ```

  The consent checkbox state already exists as `const [agree, setAgree] =
  useState(false);` (`Modal.tsx:32`) and gates the submit button
  (`Modal.tsx:294`, `disabled={!agree || isSubmitting}`). We reuse `agree`.

- Server validation convention: each bad field returns
  `res.status(400).json({ success: false, error: '<reason>' })`. Match it.

## Commands you will need

| Purpose       | Command                              | Expected on success    |
|---------------|--------------------------------------|------------------------|
| Typecheck     | `npm run lint`                       | exit 0, no errors      |
| Build         | `npm run build`                      | exit 0                 |
| Verify        | `bash scripts/run-quiet.sh verify`   | exit 0, silent on pass |
| Run server    | `node server.js`                     | logs "Server running on port 3001" |

## Scope

**In scope**:
- `server.js` — add the consent check.
- `src/components/Modal.tsx` — add `consent: agree` to the POST body.

**Out of scope** (do NOT touch):
- `leadLimiter` / rate-limit config — already correct.
- The Telegram message-formatting block — consent does not need to appear in the
  Telegram text unless you choose to; keep it out to minimize change.
- `nginx.conf` — server-side validation lives in `server.js`, not nginx.

## Git workflow

- Branch: `advisor/020-server-consent-enforcement`
- Commit style: conventional commits. Suggested:
  `feat(api): require consent===true on /api/leads (FZ-152)`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Send consent from the client

In `src/components/Modal.tsx`, add `consent: agree` to the JSON body of the
`fetch('/api/leads', ...)` call (the object at lines 89–95):

```tsx
body: JSON.stringify({
  name: submission.name,
  phone: submission.phone,
  productName: submission.productName,
  message: submission.message,
  sourceForm: submission.sourceForm,
  consent: agree,
})
```

`agree` is already in scope (state declared at `Modal.tsx:32`). Do not add new
state.

**Verify**: `npm run lint` → exit 0.

### Step 2: Enforce consent on the server

In `server.js`, inside the `POST /api/leads` handler, destructure `consent` and
reject when it is not strictly `true`. Add the check **first**, before the name
check (fail fast on missing consent):

```js
const { name, phone, productName, message, sourceForm, consent } = req.body;

if (consent !== true) {
  return res.status(400).json({ success: false, error: 'Consent required' });
}

if (!name || typeof name !== 'string' || /* ...unchanged... */) { ... }
```

Keep every other validation line exactly as-is.

**Verify**: `npm run lint` → exit 0.

### Step 3: Manual server smoke test

Start the server (`node server.js`) in one terminal, then in another run these
two curl checks. (Telegram creds may be absent locally; a missing-consent
request must be rejected with 400 **before** any Telegram call, so this test
does not need real credentials.)

```bash
# A) No consent -> must be 400 "Consent required"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3001/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","phone":"+79991234567"}'
# Expected: 400

# B) consent:false -> must also be 400
curl -s -X POST http://localhost:3001/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","phone":"+79991234567","consent":false}'
# Expected body contains: "Consent required"
```

Stop the server after the test.

**Verify**: request A prints `400`; request B's body contains
`Consent required`.

## Test plan

- The two curl checks in Step 3 are the regression checks (missing consent and
  explicit `false` both rejected with 400).
- If the Playwright suite (`tests/`) exercises the full submit flow against a
  running `server.js`, confirm it still passes (the checkbox is checked in that
  flow, so `consent: true` is sent). Run `bash scripts/run-quiet.sh test`.
  If the e2e suite does not hit the real server, skip this and rely on Step 3.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -n "consent !== true" server.js` returns one line, positioned before
      the `Invalid name` check
- [ ] `grep -n "consent: agree" src/components/Modal.tsx` returns one line
- [ ] Step 3 curl A returns HTTP 400; curl B body contains `Consent required`
- [ ] No files outside `server.js` and `src/components/Modal.tsx` modified
      (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `server.js` or `Modal.tsx` does not match the "Current state" excerpts.
- The consent check would require changing the response shape clients already
  depend on (it does not — keep `{ success, error }`).
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If plan 019 (Modal hook-order fix) is executed too, both edit `Modal.tsx` —
  execute them on separate branches or rebase; the edits are in different
  regions (019 = hook ordering near top; 020 = the `fetch` body ~line 89) and do
  not conflict logically.
- A reviewer should confirm the consent check runs **before** the Telegram
  `fetch`, so an unconsented request never triggers an outbound message.
- Future: if you want an auditable consent trail, also include consent
  timestamp/IP in the Telegram message — deferred here to keep the change
  minimal.
