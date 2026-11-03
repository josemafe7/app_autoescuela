# 0002 · Inicio de sesión propio, en la misma base de datos

- **Estado:** aceptada
- **Fecha:** 2026-11-03

## Contexto y problema

El inicio de sesión dependía de Supabase Auth y, sin él, la app guardaba el perfil tal cual en una cookie:
cualquiera podía escribir «secretaria» en la cookie y entrar como Secretaría. Los alumnos, además, no podían
entrar en local.

## Opciones consideradas

- Usuarios y sesiones propios en la base de datos SQLite.
- Una librería de autenticación (Auth.js, Better Auth…).
- Cookie firmada con una clave secreta, sin tabla de sesiones.

## Decisión

Tablas `usuarios` (correo, rol y contraseña cifrada con scrypt, que viene con Node.js) y `sesiones` (huella
del token y caducidad). La cookie solo lleva un token aleatorio. No hace falta instalar nada ni configurar
ninguna clave secreta, y cerrar sesión la invalida de verdad. Una librería añadía dependencias y
configuración para una demo con cuatro tipos de cuenta; la cookie firmada obligaba a configurar una clave
más.

## Consecuencias

- Las cuentas de prueba las crea el seed; los alumnos que da de alta Secretaría reciben la contraseña de
  prueba.
- No hay recuperación ni cambio de contraseña: queda fuera de la demo (`docs/spec.md`).
