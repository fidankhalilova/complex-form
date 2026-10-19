// Form state with blur-first validation, on-change revalidation, and partner-field updates.
'use client';

import { useState } from 'react';
import {
  dependents, rules, validateAll, validateField,
  type Errors, type Values,
} from '@/lib/validators';

const names = Object.keys(rules);
const blank: Values = Object.fromEntries(names.map((n) => [n, '']));

export function useForm() {
  const [values, setValues] = useState<Values>(blank);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Errors>({});

  const revalidate = (fields: string[], next: Values) =>
    setErrors((e) => ({
      ...e,
      ...Object.fromEntries(fields.map((n) => [n, validateField(n, next)])),
    }));

  const change = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    revalidate([name, ...(dependents[name] ?? [])].filter((n) => touched[n]), next);
  };

  const blur = (name: string) => {
    setTouched((t) => ({ ...t, [name]: true }));
    revalidate([name], values);
  };

  const submit = (): string | undefined => {
    const next = validateAll(values);
    setTouched(Object.fromEntries(names.map((n) => [n, true])));
    setErrors(next);
    return names.find((n) => next[n]);
  };

  const setError = (name: string, message: string) =>
    setErrors((e) => ({ ...e, [name]: message }));

  const error = (name: string) => (touched[name] ? errors[name] ?? '' : '');
  const isValid = names.every((n) => !validateField(n, values));

  return { values, errors, error, isValid, change, blur, submit, setError };
}