export const ISSUE_STATUSES=["submitted","under_review","verified","assigned","in_progress","resolved","closed","rejected","reopened"].map(key=>({key,label:key.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}));
export const DEPARTMENTS=["Roads & Infrastructure","Waste Management","Water & Sanitation","Electricity","Public Safety","Environment","General Administration"];
export class DepartmentAccessError extends Error{constructor(message="This task isn't assigned to your department."){super(message);this.code="FORBIDDEN";}}
async function api(path,options={}){const multipart=options.body instanceof FormData;const response=await fetch(`/api${path}`,{credentials:"include",...options,headers:{...(!multipart?{"Content-Type":"application/json"}:{}),"X-CivicAI-CSRF":"1",...options.headers}});const body=await response.json().catch(()=>({}));if(!response.ok){const E=body.error?.code==="FORBIDDEN"?DepartmentAccessError:Error;const e=new E(body.error?.message||"Request failed.");e.code=body.error?.code;throw e;}return body.data;}
export async function getDepartmentDashboard(){return api("/authority/dashboard");}
export async function getDepartmentTasks(){return (await getDepartmentDashboard()).tasks;}
export async function getDepartmentStats(){return (await getDepartmentDashboard()).stats;}
export async function getDepartmentTask(id){return api(`/reports/${encodeURIComponent(id)}`);}
export async function getDepartmentTaskActivity(id){return (await getDepartmentTask(id)).activity||[];}
export async function updateTaskStatus(id,status,_department,reason="Status updated by authority."){return api(`/reports/${encodeURIComponent(id)}/status`,{method:"POST",body:JSON.stringify({status,reason})});}
export async function uploadCompletionEvidence(id,imageDataUrl,note){const blob=await(await fetch(imageDataUrl)).blob();const form=new FormData();form.append("evidence",blob,"resolution.jpg");form.append("note",note||"");return api(`/reports/${encodeURIComponent(id)}/resolution`,{method:"POST",body:form});}
export async function markTaskCompleted(id,_completedBy,department){return updateTaskStatus(id,"resolved",department,"Issue resolved by the assigned authority.");}
export async function addDepartmentNote(id,content){return api(`/reports/${encodeURIComponent(id)}/notes`,{method:"POST",body:JSON.stringify({content})});}
export async function getDepartmentNotifications(){return (await api("/notifications")).items;}
