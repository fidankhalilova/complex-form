// Signup form: wires fields, async username check, submit errors, retry and the error summary.
'use client';

import { useState, type FormEvent } from 'react';
import ErrorSummary from '@/components/ErrorSummary';
import Field from '@/components/Field';
import { useForm } from '@/hooks/useForm';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { ServerError, submitForm, withRetry } from '@/lib/api';
import { validateField, type Values } from '@/lib/validators';

const fields = [
  { name: 'username', label: 'Username', autoComplete: 'username' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
];

const focusField = (name: string) => document.getElementById(name)?.focus();
const trimmed = (v: Values): Values => ({ ...v, username: v.username.trim(), email: v.email.trim() });

export default function SignupForm() {
  const form = useForm();
  const { values } = form;
  const check = useUsernameCheck(values.username, !validateField('username', values));
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const asyncError = check.status === 'taken' || check.status === 'failed' ? check.message : '';
  const errorOf = (n: string) => (n === 'username' ? form.error(n) || asyncError : form.error(n));
  const infoOf = (n: string) => (n === 'username' && !asyncError ? check.message : '');
  const ready = form.isValid && check.status === 'available';

  const summary = attempted
    ? fields.map((f) => ({ name: f.name, label: f.label, message: errorOf(f.name) })).filter((i) => i.message)
    : [];

  const fail = (e: unknown) => {
    if (e instanceof ServerError) {
      form.setError('email', e.message);
      focusField('email');
    } else {
      setFormError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  const send = async () => {
    setSubmitting(true);
    try {
      await withRetry(() => submitForm(trimmed(values)));
      setDone(true);
    } catch (e) {
      fail(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setAttempted(true);
    const first = form.submit() ?? (asyncError ? 'username' : undefined);
    if (first) return focusField(first);
    if (check.status === 'available') send();
  };

  if (done) return <p role="status" className="text-green-700">✓ Account created. Welcome!</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 w-full">
      <ErrorSummary items={summary} />
      {fields.map((f) => (
        <Field
          key={f.name}
          {...f}
          value={values[f.name]}
          error={errorOf(f.name)}
          info={infoOf(f.name)}
          onChange={(v) => form.change(f.name, v)}
          onBlur={() => form.blur(f.name)}
        />
      ))}
      {formError && (
        <p role="alert" className="rounded border border-red-600 p-3 text-sm text-red-600">
          ⚠ {formError} Submit again to retry.
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || check.status === 'checking'}
        aria-disabled={!ready}
        className="rounded bg-black px-4 py-2 text-white aria-disabled:opacity-50 disabled:cursor-wait"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}