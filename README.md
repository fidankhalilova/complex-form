# Complex Form with Client-Side Validation

Next.js (TypeScript), Tailwind and React hooks only. 

## Structure

| File | Purpose |
|---|---|
| `lib/validators.ts` | Pure rule functions and the per-field `rules` config (data, not components) |
| `lib/api.ts` | `setTimeout`-simulated `checkUsername`, `submitForm` and `withRetry` |
| `hooks/useForm.ts` | Values, touched, errors, timing and cross-field revalidation |
| `hooks/useUsernameCheck.ts` | Debounced async username check |
| `components/Field.tsx` | Accessible input with inline error and status line |
| `components/ErrorSummary.tsx` | Error list with links to the invalid fields |
| `components/SignupForm.tsx` | Wires everything together and handles submit |

## How validation works

- **Layered:** sync rules run first. The async username check only runs once they pass.
- **Timing:** a field validates on its first blur. After that it revalidates on every change, so errors clear as soon as they are fixed. Submit validates everything.
- **Cross-field:** changing `password` revalidates `confirmPassword` (declared in `dependents`), so "Passwords do not match" is never stale.
- **Async check:** debounced 500ms, cancelled on unmount, and stale responses are ignored.
- **Custom rules per field:** each field is an array in `rules`. Adding a rule is one line, for example `maxLength(30)`.
- **Trimming:** `required`, `isEmail` and `pattern` trim input. Passwords are never trimmed.

## Submit behaviour

- **Disabled button:** the button looks disabled and has `aria-disabled`, but stays clickable, so clicking it explains what is wrong. It is truly `disabled` only while submitting or while the username is being checked.
- **Failed submit:** every error is shown, a summary with links appears, and focus moves to the first invalid field.
- **Server error** (duplicate email): shown inline on the email field.
- **Network failure:** `withRetry` retries twice with backoff (500ms, then 1000ms). If it still fails, a general alert explains and the user can submit again.

## Accessibility

- `aria-invalid`, `aria-describedby` and `role="alert"` on every error.
- A `role="status"` line that stays mounted, so "Checking…" and "Available" are announced politely.
- Errors use icon, text and border colour, never colour alone.
- `noValidate` on the form, so the browser does not run its own validation first.

## Try it

| Input | Result |
|---|---|
| Username `admin`, `root` or `john` | "Already taken" |
| Email `taken@example.com` | Server error on the email field |
| Username `offline` | Network failure on every attempt, so retries run out |
| Anything else | About 30% of submits fail randomly, and retry usually recovers |