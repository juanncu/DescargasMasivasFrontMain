import { Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";   
import { AppError } from "../models/errores.model";

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService { 
    procesar(error: any): AppError {

        if (error instanceof HttpErrorResponse && error.status === 0) {
            return {
                origen: 'CONEXION',
                mensajeUsuario: 'No se pudo establecer conexión con el servidor' };
            } if (error?.error?.tipo === 'DATABASE') {
                return {
                    origen: 'DATABASE',
                    mensajeUsuario: 'Error al conectarse con la base de datos' };
            } 

         if (error instanceof HttpErrorResponse) {
            return {
                origen: 'BACKEND', 
                mensajeUsuario: error.error?.mensajeUsuario || 'Error en el servidor'};
        } return {
            origen: 'FRONTEND',
            mensajeUsuario: error.message || 'Error en la aplicación' };
    }   }