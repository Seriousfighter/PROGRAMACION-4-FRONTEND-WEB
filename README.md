# 🍽️ API Mesas Disponibles — Sistema de Gestión de Disponibilidad

> **Enfoque del Repositorio:** Creación de la **API REST** para el sistema de gestión de disponibilidad de mesas de restaurantes. Este desarrollo está basado estrictamente en la documentación de requerimientos elaborada.

---

## 📋 Tabla de Contenidos
1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Requisitos Funcionales (RF)](#2-requisitos-funcionales-rf)
3. [Requisitos No Funcionales (RNF)](#3-requisitos-no-funcionales-rnf)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Arquitectura del Sistema](#5-arquitectura-del-sistema)
6. [Especificación de la API (Endpoints)](#6-especificación-de-la-api-endpoints)
7. [Plan de Pruebas y Matriz de Testing](#7-plan-de-pruebas-y-matriz-de-testing)
8. [Seguridad e Investigación](#8-seguridad-e-investigación)
9. [Fases y Frontend](#9-fases-y-frontend)
10. [Hoja de Ruta de Desarrollo (Etapas)](#10-hoja-de-ruta-de-desarrollo-etapas)
11. [Preguntas Clave de Dominio e Integración](#11-preguntas-clave-de-dominio-e-integración)

---

## 1. Visión General del Sistema

El sistema permite a administradores gestionar sus restaurantes y el estado de sus mesas en tiempo real (disponible/ocupado/etc.), mientras ofrece un portal público donde los clientes pueden consultar qué restaurantes tienen mayor disponibilidad.

### Componentes de la Arquitectura

```
                    ┌─────────────────────┐
                    │       MySQL         │
                    │                     │
                    │ users               │
                    │ restaurants         │
                    │ tables              │
                    │ table_statuses      │
                    └──────────┬──────────┘
                               │
                               │
                    ┌──────────▼──────────┐
                    │        API          │
                    │      REST/JSON      │
                    │                     │
                    │ JWT                 │
                    │ Auth                │
                    │ CRUD                │
                    │ Validaciones        │
                    │ Sanitización        │
                    │ HTTP Status Codes   │
                    └───────┬───────┬─────┘
                            │       │
                   ┌────────▼───┐ ┌─▼────────────┐
                   │ Frontend 1 │ │ Frontend 2   │
                   │ Gestión    │ │ Consulta     │
                   │ (Privado)  │ │ pública      │
                   └────────────┘ └──────────────┘
```

---

## 2. Requisitos Funcionales (RF)

### Autenticación y Usuarios
* **RF-01 — Registro de usuario:** El sistema permitirá registrar usuarios con `nombre`, `email` y `contraseña`. La contraseña nunca debe guardarse en texto plano (requiere hashing seguro).
* **RF-02 — Inicio de sesión:** Autenticación mediante email y contraseña. Devuelve un Token JWT en caso de credenciales válidas.
* **RF-03 — Autenticación mediante JWT:** Los endpoints privados deberán exigir y validar un JWT (verificando presencia, formato, firma, expiración y existencia del usuario).

### Restaurantes (Panel Administrador)
* **RF-04 — Crear restaurante:** Usuario autenticado crea un restaurante (`nombre`, `dirección`, `teléfono`, `descripción`).
* **RF-05 — Consultar restaurantes:** Un usuario solo puede listar los restaurantes que él administra.
* **RF-06 — Modificar restaurante:** Permitir la edición de los datos de un restaurante propio.
* **RF-07 — Eliminar restaurante:** Eliminar un restaurante administrado por el usuario.

### Mesas
* **RF-08 — Crear mesa:** Agregar mesas a un restaurante (`detalle`, `cantidad_sillas`, `estado_id`).
* **RF-09 — Consultar mesas:** Listar las mesas pertenecientes a un restaurante.
* **RF-10 — Modificar mesa:** Editar `detalle`, `cantidad_sillas` o `estado_id`.
* **RF-11 — Eliminar mesa:** Eliminar una mesa específica.
* **RF-12 — Cambiar estado de mesa:** Endpoint específico (`PATCH`) para rotar rápidamente el estado de una mesa. Cada clic en el Frontend avanza al siguiente `status_id` disponible (ciclo cerrado, ej. *Disponible* → *Ocupada* → *Reservada* → *Disponible*), sin que el cliente envíe el nuevo estado en el body.

### Consulta Pública
* **RF-13 — Restaurantes por disponibilidad:** Endpoint sin autenticación que devuelve la lista de restaurantes ordenados descendentemente según la cantidad de mesas disponibles.

---

## 3. Requisitos No Funcionales (RNF)

* **RNF-01 — Seguridad:** Hashing obligatorio para contraseñas (ej. bcrypt, argon2).
* **RNF-02 — Autenticación:** Proteger recursos privados mediante Tokens JWT.
* **RNF-03 — API REST:** Utilización estricta de verbos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
* **RNF-04 — JSON:** Formato estándar de intercambio de datos.
* **RNF-05 — Códigos HTTP:** Uso semántico adecuado:
  * `200 OK`, `201 Created`, `204 No Content`
  * `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`
  * `500 Internal Server Error`
* **RNF-06 — Validación:** Validar todo payload de entrada antes de ser procesado.
* **RNF-07 — Sanitización:** Tratar entradas para evitar vulnerabilidades.
* **RNF-08 — Integridad de datos:** Relaciones con Claves Primarias (PK) y Foráneas (FK) en base de datos.
* **RNF-09 — Manejo de errores:** Respuestas de error claras y consistentes (ej. `{"message": "El restaurante no existe"}`).
* **RNF-10 — Separación de responsabilidades:** Arquitectura desacoplada en capas (Frontend, API, DB).

---

## 4. Modelo de Datos

### Estructura de Tablas

```sql
users
----------------
id (PK)
name
email (UNIQUE)
password
created_at
updated_at

restaurants
----------------
id (PK)
user_id (FK -> users.id)
name
address
phone
description
created_at
updated_at

tables
----------------
id (PK)
restaurant_id (FK -> restaurants.id)
detail
chairs
status_id (FK -> table_statuses.id)
created_at
updated_at

table_statuses
----------------
id (PK)
name
```

---

## 5. Arquitectura del Sistema

El flujo interno de procesamiento dentro de la API debe cumplir con el patrón de diseño en capas:

Frontend
   │
   │ PATCH /api/tables/15/status etc
   │ JSON
   ▼
Routes
   │
   ▼
Controller
   │
   ▼
Validation
   │
   ▼
Service
   │
   ▼
Model / ORM
   │
   ▼
MySQL



Response
MySQL
   │
   ▼
Model / ORM
   │
   ▼
Service
   │
   ▼
Controller
   │
   ▼
JSON
   │
   ▼
Frontend




---



## 6. Especificación de la API (Endpoints)

### Resumen de Rutas

| Categoría        | Método  | Endpoint                       | Autenticado | Descripción |
| :---             | :---    | :---                           | :---:       | :--- |
| **Auth**         | `POST`  | `/api/register`                | No          | Registro de usuario |
| **Auth**         | `POST`  | `/api/login`                   | No          | Autenticación y obtención de JWT |
| **Auth**         | `POST`  | `/api/logout`                  | Sí          | Cierre de sesión / Invalidación |
| **Auth**         | `GET`   | `/api/me`                      | Sí          | Perfil del usuario autenticado |
| **Restaurantes** | `GET`   | `/api/restaurants`             | Sí          | Listar restaurantes del administrador |
| **Restaurantes** | `POST`  | `/api/restaurants`             | Sí          | Crear restaurante |
| **Restaurantes** | `GET`   | `/api/restaurants/{id}`        | Sí          | Obtener detalle de restaurante |
| **Restaurantes** | `PUT`   | `/api/restaurants/{id}`        | Sí          | Actualizar restaurante |
| **Restaurantes** | `DELETE`| `/api/restaurants/{id}`        | Sí          | Eliminar restaurante |
| **Mesas**        | `GET`   | `/api/restaurants/{id}/tables` | Sí          | Listar mesas de un restaurante |
| **Mesas**        | `POST`  | `/api/restaurants/{id}/tables` | Sí          | Crear mesa en un restaurante |
| **Mesas**        | `GET`   | `/api/tables/{id}`             | Sí          | Obtener detalle de una mesa |
| **Mesas**        | `PUT`   | `/api/tables/{id}`             | Sí          | Actualizar datos de una mesa |
| **Mesas**        | `DELETE`| `/api/tables/{id}`             | Sí          | Eliminar una mesa |
| **Mesas**        | `PATCH` | `/api/tables/{id}/status`      | Sí          | Rotar al siguiente estado disponible (sin body) |
| **Público**      | `GET`   | `/api/public/restaurants`      | No          | Listar por disponibilidad descendente |

---

### Plantilla de Documentación por Endpoint

Para el desarrollo del proyecto, cada endpoint deberá ser documentado individualmente con el siguiente esquema:

```markdown
### [MÉTODO] /api/ruta
* **Descripción:** ...
* **Autenticación:** Sí / No
* **Headers:** 
  `Authorization: Bearer <token>`
  `Content-Type: application/json`
* **Body:**
```json
{ ... }
```
* **Respuestas:**
  * `200 OK` / `201 Created` / `204 No Content`: JSON o Vacío
  * `401 Unauthorized`: Token faltante/inválido
  * `404 Not Found`: Recurso no existente
  * `422 Unprocessable Entity`: Errores de validación
```

---

## 7. Plan de Pruebas y Matriz de Testing

### Matriz de Casos de Prueba Iniciales

| Caso                      | Endpoint                        | Entrada (Payload / Headers) | Resultado Esperado |
| :---                      | :---                            | :---                        | :---: |
| Login correcto            | `POST /api/login`               | Credenciales válidas        | `200 OK` + JWT |
| Login incorrecto          |`POST /api/login`                | Password incorrecta         | `401 Unauthorized` |
| Crear restaurante         | `POST /api/restaurants`         | Datos válidos + JWT         | `201 Created` |
| Crear restaurante sin JWT | `POST /api/restaurants`         | Sin header Authorization    | `401 Unauthorized` |
| Restaurante inexistente   | `GET /api/restaurants/999`      | —                           | `404 Not Found` |
| Crear mesa                | `POST /api/restaurants/1/tables`| Datos válidos               | `201 Created` |
| Cambiar estado            | `PATCH /api/tables/15/status`   | Sin body (rota al siguiente `status_id`) | `200 OK` |

---

## 8. Seguridad e Investigación

Se deben aplicar pruebas deliberadamente maliciosas para verificar la robustez del sistema frente a:

* **SQL Injection:** Probar inyecciones en los campos de entrada (ej. `{"email": "' OR 1=1 --"}`) y asegurar el uso de consultas preparadas / ORM.
* **XSS & Sanitización:** Validar y limpiar datos para evitar la ejecución de código script arbitrario en el Frontend.
* **Autenticación y Expiración:** Controlar el ciclo de vida del JWT y revocación.
* **CORS & Exposición de datos:** Configurar debidamente la política de orígenes cruzados y evitar devolver campos sensibles (ej. `password_hash`) en las respuestas de la API.

---

## 9. Fases y Frontend

### Flujos del Frontend

```
[ FRONTEND PRIVADO ]
Login → Dashboard → Mis Restaurantes → Detalle Restaurante → Gestión de Mesas (Cambio de estado)

[ FRONTEND PÚBLICO ]
Pantalla Pública (Listado de restaurantes ordenados por mesas disponibles)
```

---

## 10. Hoja de Ruta de Desarrollo (Etapas)

- [ ] **Etapa 0: Definición** — Alcance, actores y casos de uso (Sin programar).
- [ ] **Etapa 1: Diseño** — Modelo Entidad-Relación, wireframes y plan de pruebas.
- [ ] **Etapa 2: Base del Proyecto** — Estructura del repositorio (`/api`, `/frontend-admin`, `/frontend-public`, `/docs`), variables `.env`, Docker, Git.
- [ ] **Etapa 3: Base de Datos** — Creación de tablas, constraints, *seeds* iniciales (`table_statuses`) y datos de prueba.
- [ ] **Etapa 4: Autenticación** — Registro, Login, hashing, middleware de JWT y `/api/me`.
- [ ] **Etapa 5: CRUD Restaurantes** — Implementación por capas (Ruta $\rightarrow$ Controlador $\rightarrow$ Servicio $\rightarrow$ Modelo).
- [ ] **Etapa 6: CRUD Mesas** — Control de mesas y endpoint `PATCH /tables/{id}/status`.
- [ ] **Etapa 7: Endpoint Público** — Query optimizada con `COUNT`, `WHERE status = disponible`, `GROUP BY` y `ORDER BY`.
- [ ] **Etapa 8: Frontend** — Consumo e integración de las APIs creadas.
- [ ] **Etapa 9: Testing** — Pruebas funcionales, de integración y seguridad.
- [ ] **Etapa 10: Documentación Final** — Guías completas de instalación, arquitectura y decisión de diseño.

---

## 11. Preguntas Clave de Dominio e Integración

> 💡 **Nota de preparación para el equipo:** Todos los integrantes del grupo deben estar capacitados para responder estas preguntas teóricas y técnicas durante la defensa del proyecto.

### Preguntas Teóricas del Modelo de Datos
1. **¿Qué es una PK (Primary Key)?**
2. **¿Qué es una FK (Foreign Key)?**
3. **¿Por qué la tabla `tables` tiene el campo `restaurant_id`?**
4. **¿Por qué existe la tabla `table_statuses` en lugar de guardar un texto directo?**
5. **¿Qué es una relación 1:N (Uno a Muchos)?**
6. **¿Qué pasa en la base de datos si elimino un restaurante que tiene mesas asociadas?** *(Concepto de eliminación en cascada o restricción).*
7. **¿Qué es una restricción `UNIQUE` y por qué se aplica en el `email` de usuarios?**
8. **¿Qué significa la restricción `NOT NULL`?**

### Pregunta de Integración de Flujo Completo
> **¿Qué ocurre desde que un usuario hace clic en "Cambiar estado" en el Frontend hasta que la base de datos modifica la mesa y el Frontend recibe la respuesta?**

1. **Frontend:** Evento click llama al cliente HTTP enviando un `PATCH /api/tables/{id}/status` con el header `Authorization: Bearer <token>`, sin body (el nuevo estado no lo decide el cliente).
2. **API (Middleware):** Intercepta la petición, valida la presencia y validez del JWT.
3. **API (Router / Controller):** Recibe la petición, valida y sanitiza el parámetro `{id}`.
4. **API (Service / Business Layer):** Verifica que la mesa exista y pertenezca a un restaurante administrado por el usuario autenticado, obtiene el `status_id` actual y calcula el siguiente `status_id` del ciclo disponible en `table_statuses`.
5. **API (Model / Database):** Ejecuta la sentencia `UPDATE tables SET status_id = ?, updated_at = ? WHERE id = ?` con el `status_id` calculado.
6. **Base de Datos:** Procesa la transacción y confirma los cambios.
7. **Respuesta HTTP:** La API retorna una respuesta `200 OK` con la información actualizada de la mesa.
8. **Frontend:** Recibe la respuesta, oculta indicadores de *loading* y actualiza el estado visual de la mesa en la interfaz.