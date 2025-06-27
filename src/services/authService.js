import { laboratorioApi } from '../api';


export async function loginUserDB(use_correo, use_contrasena) {

    return await laboratorioApi.post('auth/login', {use_correo, use_contrasena});
}

export async function changePasswordDB(use_correo, use_old_contrasena, use_new_contrasena) {

    return await laboratorioApi.post('auth/changePassword', { use_correo, use_old_contrasena, use_new_contrasena });
}