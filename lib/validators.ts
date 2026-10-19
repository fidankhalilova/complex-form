// Pure validation rules kept as data, so they can be tested without rendering anything.
export type Values = Record<string, string>;
export type Errors = Record<string, string>;
export type Rule = (value: string, values: Values) => string;

export const required: Rule = (v) => (v.trim() ? '' : 'This field is required');

export const isEmail: Rule = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address';

export const minLength = (n: number): Rule => (v) =>
  v.length >= n ? '' : `Must be at least ${n} characters`;

export const pattern = (re: RegExp, message: string): Rule => (v) =>
  re.test(v.trim()) ? '' : message;

export const matches = (other: string, message: string): Rule => (v, all) =>
  v === (all[other] ?? '') ? '' : message;

export const rules: Record<string, Rule[]> = {
  username: [required, pattern(/^\w{3,20}$/, 'Use 3 to 20 letters, numbers or underscores')],
  email: [required, isEmail],
  password: [required, minLength(8)],
  confirmPassword: [required, matches('password', 'Passwords do not match')],
};

// When the key field changes, these partner fields must be revalidated too.
export const dependents: Record<string, string[]> = {
  password: ['confirmPassword'],
};

export const validateField = (name: string, values: Values): string =>
  rules[name].map((rule) => rule(values[name] ?? '', values)).find(Boolean) ?? '';

export const validateAll = (values: Values): Errors =>
  Object.fromEntries(Object.keys(rules).map((n) => [n, validateField(n, values)]));