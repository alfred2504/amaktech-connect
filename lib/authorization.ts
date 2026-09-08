import {requireAdmin} from './auth';
export async function requireAuth(){
	const user = await requireAdmin()
	return {user}
}
export async function requirePermission(_permission:string){
	const user = await requireAdmin()
	return {user}
}
export async function hasPermission(_permission:string){try{await requireAdmin();return true}catch{return false}}
export async function requireRole(_roles: string | string[]){
	const user = await requireAdmin()
	return {user}
}
