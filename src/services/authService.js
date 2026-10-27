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

// "Mi perfil": datos propios (sin correo, rol ni laboratorio)
export async function updateProfileDB(data) {

    return await laboratorioApi.patch('auth/me', data);
}

// firma: userId vacío = la propia; con userId la administra el administrador del laboratorio
const signaturePath = (userId) => (userId ? `auth/${userId}/signature` : 'auth/me/signature');

export async function getSignatureDB(userId) {

    return await laboratorioApi.get(signaturePath(userId));
}

export async function uploadSignatureDB(userId, file) {

    const formData = new FormData();
    formData.append('file', file);
    return await laboratorioApi.put(signaturePath(userId), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function deleteSignatureDB(userId) {

    return await laboratorioApi.delete(signaturePath(userId));
}
