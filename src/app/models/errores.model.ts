export interface AppError {
    origen: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'CONEXION';
    mensajeUsuario: string;
    detalle?: any;
}