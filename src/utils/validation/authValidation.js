export function validateEmail(value) {
  if (!value || !value.trim()) return "Please enter your email address.";
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
}

export function validateRequired(value, message) {
  if (!value || !value.trim()) return message;
  return "";
}

export function validateFullName(value) {
  if (!value || !value.trim()) return "Please enter your full name.";
  if (value.trim().length < 2) return "Your name should be at least 2 characters.";
  return "";
}

export function validatePhone(value) {
  if (!value || !value.trim()) return "Please enter your phone number.";
  if (!/^[+\d][\d\s-]{7,}$/.test(value.trim())) {
    return "Enter a valid phone number (e.g. +977 9812 345 678).";
  }
  return "";
}

/* ------------------------------------------------------------------ */
/* Password rules + strength                                           */
/* ------------------------------------------------------------------ */

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "Number", test: (v) => /\d/.test(v) },
  { id: "special", label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordRules(value) {
  return PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(value || "") }));
}

export function passwordStrength(value) {
  const v = value || "";
  const met = PASSWORD_RULES.filter((r) => r.test(v)).length;
  if (!v) return { score: 0, label: "" };
  if (met <= 2) return { score: 1, label: "Weak" };
  if (met <= 4) return { score: 2, label: "Medium" };
  return { score: 3, label: "Strong" };
}

export function validatePassword(value) {
  if (!value) return "Please enter a password.";
  if (value.length < 8 || value.length > 128) return "Password must be between 8 and 128 characters.";
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Include uppercase, lowercase, number, and special characters.";
  }
  return "";
}

export function validateConfirm(value, compare) {
  if (!value) return "Please repeat your password.";
  if (value !== compare) return "Passwords don't match.";
  return "";
}
