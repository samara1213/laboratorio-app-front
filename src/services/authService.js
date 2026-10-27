import { laboratorioApi } from '../api';


export async function loginUserDB(use_correo, use_contrasena) {

    return await laboratorioApi.post('auth/login', {use_correo, use_contrasena});
}

export async function changePasswordDB(use_correo, use_old_contrasena, use_new_contrasena) {

    return await laboratorioApi.post('auth/changePassword', { use_correo, use_old_contrasena, use_new_contrasena });
}

// sesión actual: usuario, laboratorio, permisos por módulo y menú
export async function getMeDB() {

    return await laboratorioApi.get('auth/me');
}

export async function forgotPasswordDB(use_correo) {

    return await laboratorioApi.post('auth/forgot-password', { use_correo });
}

export async function resetPasswordDB(token, use_new_contrasena) {

    return await laboratorioApi.post('auth/reset-password', { token, use_new_contrasena });
}
