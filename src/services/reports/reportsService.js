export const REPORT_STATUS_ORDER=["submitted","under_review","verified","assigned","in_progress","resolved","closed"];
async function api(path,options={}){const response=await fetch(`/api${path}`,{credentials:"include",...options,headers:{"Content-Type":"application/json","X-CivicAI-CSRF":"1",...options.headers}});const body=await response.json().catch(()=>({}));if(!response.ok){const error=new Error(body.error?.message||"Request failed.");error.code=body.error?.code;throw error;}return body.data;}
export function reportSeverity(priority){return priority>=85?"critical":priority>=70?"high":priority>=45?"medium":"low";}
export function filterReports(items,{status="all",query=""}={}){const q=query.trim().toLowerCase();return items.filter(r=>(status==="all"||r.status===status)&&(!q||[r.id,r.title,r.categoryLabel,r.description].filter(Boolean).join(" ").toLowerCase().includes(q)));}
export function sortReports(items,sort="newest"){return[...items].sort((a,b)=>sort==="priority"?(b.priority??-1)-(a.priority??-1):sort==="oldest"?new Date(a.submittedAt)-new Date(b.submittedAt):sort==="updated"?new Date(b.updatedAt)-new Date(a.updatedAt):new Date(b.submittedAt)-new Date(a.submittedAt));}
export async function getMyReports({page=1,limit=20,status="all",sort="newest",query=""}={}){const params=new URLSearchParams({page:String(page),limit:String(limit),status,sort});if(query.trim())params.set("search",query.trim());return api(`/reports/my?${params}`);}
export async function getReport(id){return api(`/reports/${encodeURIComponent(id)}`);}
export async function getReportTimeline(id){const report=await getReport(id);return(report.timeline||[]).map((h,i,all)=>({key:h.newStatus,label:h.newStatus.replaceAll("_"," "),at:h.createdAt,note:h.reason,detail:h.reason,done:true,current:i===all.length-1}));}
export async function getReportActivity(id){return(await getReport(id)).activity||[];}
export async function getResolutionEvidence(id){const report=await getReport(id),before=report.evidence?.find(e=>e.kind==="citizen"),after=report.evidence?.find(e=>e.kind==="resolution");return before&&after?{before:{src:before.url,label:"Original citizen photo",date:before.uploadedAt},after:{src:after.url,label:"Resolution photo",date:after.uploadedAt}}:null;}
export async function getCommunityConfirmation(){return null;}
export async function confirmResolution(){throw new Error("Community confirmation is not enabled for this report.");}
export async function submitResolutionFeedback(){throw new Error("Community confirmation is not enabled for this report.");}
export async function getNotifications(){return api("/notifications");}
export function markNotificationRead(){return{ids:[],all:false};}
export function markAllNotificationsRead(){return{ids:[],all:true};}
