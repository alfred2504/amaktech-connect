import {requireAdmin} from './auth';
export async function requirePermission(_permission:string){return requireAdmin()}
export async function hasPermission(_permission:string){try{await requireAdmin();return true}catch{return false}}
