/** Mirrors the backend-controlled taxonomy; arbitrary browser-created categories are not allowed. */
export const DEFAULT_CATEGORIES = [
  { key: "road", label: "Road Damage", department: "Roads & Infrastructure" },
  { key: "pothole", label: "Pothole", department: "Roads & Infrastructure" },
  { key: "electric_line", label: "Electric Line", department: "Electricity" },
  { key: "light_pole", label: "Light Pole", department: "Electricity" },
  { key: "garbage_overflow", label: "Garbage Overflow", department: "Waste Management" },
  { key: "corruption", label: "Corruption", department: "Anti-Corruption & Grievance" },
  { key: "water", label: "Water & Sewage", department: "Water & Sanitation" },
  { key: "drainage", label: "Drainage & Flooding", department: "Roads & Infrastructure" },
  { key: "safety", label: "Public Safety", department: "Public Safety" },
  { key: "environment", label: "Environment", department: "Environment" },
  { key: "public_property", label: "Public Property", department: "Public Works" },
  { key: "transportation", label: "Transportation", department: "Roads & Infrastructure" },
  { key: "other", label: "Other Civic Issue", department: "General Administration" },
].map((category) => ({ ...category, source: "system", active: true }));

export function listCategories({ activeOnly = false } = {}) { return activeOnly ? DEFAULT_CATEGORIES.filter((item) => item.active) : DEFAULT_CATEGORIES; }
export function getCategory(key) { return DEFAULT_CATEGORIES.find((item) => item.key === key) ?? null; }
