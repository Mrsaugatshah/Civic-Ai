import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";

const allowed=new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
export const uploadDir=path.resolve(import.meta.dirname,"uploads");
fs.mkdirSync(uploadDir,{recursive:true,mode:0o750});

export async function validateEvidence(files=[]) {
  const ready=[];
  for(const file of files){
    if(!file?.buffer||file.size>8*1024*1024)throw Object.assign(new Error("Each evidence image must be 8 MB or smaller."),{status:400,code:"INVALID_EVIDENCE"});
    const detected=await fileTypeFromBuffer(file.buffer); const ext=allowed.get(detected?.mime);
    if(!ext)throw Object.assign(new Error("Evidence must be a genuine JPEG, PNG, or WebP image."),{status:400,code:"INVALID_EVIDENCE"});
    ready.push({...file,mimeType:detected.mime,storageName:`${randomUUID()}.${ext}`,originalName:path.basename(file.originalname).replace(/[\u0000-\u001f]/g,"").slice(0,180)});
  }
  return ready;
}
export function storeEvidence(files){for(const file of files)fs.writeFileSync(path.join(uploadDir,file.storageName),file.buffer,{flag:"wx",mode:0o640});}
export function removeEvidence(files){for(const file of files){try{fs.unlinkSync(path.join(uploadDir,file.storageName));}catch{/* best effort rollback */}}}
