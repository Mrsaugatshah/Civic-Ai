import { CATEGORIES } from "./analysis.js";

export const CATEGORY_KEYS = new Set(CATEGORIES.map((item) => item.key));
export const STATUSES = ["submitted", "under_review", "verified", "assigned", "in_progress", "resolved", "closed", "rejected", "reopened"];
export const STATUS_TRANSITIONS = {
  submitted: ["under_review", "rejected"], under_review: ["verified", "rejected"],
  verified: ["assigned", "rejected"], assigned: ["in_progress"],
  in_progress: ["resolved"], resolved: ["closed", "reopened"], reopened: ["assigned", "in_progress"],
  closed: [], rejected: ["reopened"],
};

export function cleanText(value, { min, max, name }) {
  if (typeof value !== "string") return { error: `${name} must be text.` };
  const valueClean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  if (valueClean.length < min || valueClean.length > max) return { error: `${name} must be between ${min} and ${max} characters.` };
  if (!/[\p{L}\p{N}]{3}/u.test(valueClean)) return { error: `${name} must contain meaningful text.` };
  return { value: valueClean };
}

export function validateReportInput(body) {
  const title=cleanText(body.title, {min:5,max:120,name:"Title"}); if(title.error)return title;
  const description=cleanText(body.description, {min:20,max:2000,name:"Description"}); if(description.error)return description;
  const category=body.category || "other"; if(typeof category!=="string"||!CATEGORY_KEYS.has(category))return {error:"Choose a valid category."};
  const latitude=Number(body.latitude); const longitude=Number(body.longitude);
  if(!Number.isFinite(latitude)||latitude < -90||latitude > 90||!Number.isFinite(longitude)||longitude < -180||longitude > 180)return {error:"Choose a valid map location."};
  const address=cleanText(body.address,{min:3,max:240,name:"Address"}); if(address.error)return address;
  return {value:{title:title.value,description:description.value,category,latitude,longitude,address:address.value,ward:typeof body.ward==="string"?body.ward.trim().slice(0,80):"",municipality:typeof body.municipality==="string"?body.municipality.trim().slice(0,100):"",province:typeof body.province==="string"?body.province.trim().slice(0,100):""}};
}
