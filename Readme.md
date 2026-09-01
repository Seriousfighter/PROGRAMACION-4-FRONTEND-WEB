# 🍽️ Web — Gestión de Disponibilidad de Mesas

> **Repositorio del Frontend Web:** Aplicación web para la gestión de restaurantes y disponibilidad de mesas.
>
> Este proyecto consume la **API REST Mesas Disponibles** y representa la interfaz web para los administradores de restaurantes.

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Objetivo del Frontend](#2-objetivo-del-frontend)
3. [Relación con la API](#3-relación-con-la-api)
4. [Funcionalidades](#4-funcionalidades)
5. [Flujos de Usuario](#5-flujos-de-usuario)
6. [Autenticación](#6-autenticación)
7. [Consumo de la API](#7-consumo-de-la-api)
8. [Arquitectura del Frontend](#8-arquitectura-del-frontend)
9. [Estructura del Proyecto](#9-estructura-del-proyecto)
10. [Manejo de Estados](#10-manejo-de-estados)
11. [Validaciones y Errores](#11-validaciones-y-errores)
12. [Seguridad](#12-seguridad)
13. [Requisitos No Funcionales](#13-requisitos-no-funcionales)
14. [Etapas de Desarrollo](#14-etapas-de-desarrollo)
15. [Diferencias con el Frontend Mobile](#15-diferencias-con-el-frontend-mobile)

---

# 1. Visión General

El sistema está compuesto por una API REST y diferentes clientes que consumen dicha API.

```text
                         ┌─────────────────────┐
                         │       MySQL         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │        API          │
                         │      REST/JSON      │
                         └─────────┬───────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
              HTTP / JSON                 HTTP / JSON
                     │                           │
                     ▼                           ▼
          ┌──────────────────┐        ┌──────────────────┐
          │   Frontend Web   │        │  Frontend Mobile │
          │                  │        │                  │
          │ Este repositorio │        │ Futuro proyecto  │
          └──────────────────┘        └──────────────────┘
```

El Frontend Web **no se conecta directamente a MySQL**.

Toda la información se obtiene y modifica mediante la API.

---

# 2. Objetivo del Frontend

El objetivo principal es desarrollar una aplicación web que permita a un administrador:

- Iniciar sesión.
- Consultar su restaurante.
- Modificar los datos del restaurante.
- Consultar las mesas.
- Crear mesas.
- Modificar mesas.
- Eliminar mesas.
- Cambiar rápidamente el estado de una mesa.
- Visualizar de forma clara la disponibilidad actual.

El frontend también deberá consumir el endpoint público para mostrar los restaurantes ordenados según la cantidad de mesas disponibles.

---

# 3. Relación con la API

La API es la responsable de:

- Autenticación.
- Autorización.
- Validación de datos.
- Lógica de negocio.
- Acceso a MySQL.
- Persistencia de información.

El frontend es responsable de:

- Interfaz gráfica.
- Interacción con el usuario.
- Formularios.
- Navegación.
- Mostrar información.
- Mostrar estados de carga.
- Mostrar errores.
- Enviar solicitudes HTTP a la API.

### Separación de responsabilidades

```text
Frontend
    │
    │ HTTP / JSON
    ▼
API
    │
    ▼
Base de Datos
```

El frontend **no debe implementar lógica que corresponda al backend**.

Por ejemplo, el frontend puede mostrar:

```text
Mesa disponible
```

pero la API es la que determina cuál es el estado real de la mesa.

---

# 4. Funcionalidades

## 4.1 Autenticación

### Login

El usuario deberá ingresar:

- Email
- Contraseña

El frontend enviará:

```http
POST /api/login
```

La API devolverá un JWT.

El frontend deberá almacenar el token y utilizarlo para las siguientes solicitudes autenticadas.

---

## 4.2 Dashboard

Luego de iniciar sesión, el usuario accederá a un dashboard.

Deberá permitir visualizar rápidamente:

- Nombre del restaurante.
- Cantidad total de mesas.
- Mesas disponibles.
- Mesas ocupadas/no disponibles.
- Información básica del restaurante.

---

## 4.3 Restaurante

El usuario podrá consultar y modificar los datos de su restaurante:

```text
Nombre
Ubicación
Teléfono
Descripción
```

El frontend utilizará:

```http
GET /api/restaurant
PUT /api/restaurant/{id}
DELETE /api/restaurant/{id}
```

---

## 4.4 Gestión de mesas

El administrador podrá:

- Listar mesas.
- Crear una mesa.
- Editar una mesa.
- Eliminar una mesa.
- Cambiar su estado.

Cada mesa mostrará:

```text
Mesa 1

Detalle:
"Junto a la ventana"

Sillas:
4

Estado:
DISPONIBLE
```

---

## 4.5 Cambio rápido de estado

El usuario podrá cambiar el estado de una mesa mediante una acción rápida.

Por ejemplo:

```text
┌─────────────────────────┐
│ Mesa 4                  │
│ 4 sillas                │
│                         │
│ 🟢 DISPONIBLE-          │
│                         │
│ [ Cambiar estado ]      │
└─────────────────────────┘
```

El frontend enviará:

```http
PATCH /api/tables/{id}/status
```

sin enviar el nuevo estado.

La API será responsable de determinar el siguiente estado.

El frontend recibirá la respuesta y actualizará la interfaz.

---

# 5. Flujos de Usuario

## 5.1 Inicio de sesión

```text
Usuario
   │
   ▼
Formulario Login
   │
   ▼
POST /api/login
   │
   ▼
¿Credenciales válidas?
   │
   ├── NO ──► Mostrar error
   │
   └── SÍ
        │
        ▼
      JWT
        │
        ▼
    Guardar sesión
        │
        ▼
     Dashboard
```

---

## 5.2 Gestión de mesas

```text
Dashboard
    │
    ▼
Restaurante
    │
    ▼
Mesas
    │
    ├── Crear
    │
    ├── Editar
    │
    ├── Eliminar
    │
    └── Cambiar estado
```

---

## 5.3 Consulta pública

La aplicación deberá disponer de una vista pública que no requiera autenticación.

```http
GET /api/public/restaurants
```

La información deberá mostrarse ordenada por cantidad de mesas disponibles.

Ejemplo:

```text
┌─────────────────────────────┐
│ Restaurante El Buen Sabor   │
│ 12 mesas disponibles        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Restaurante La Esquina      │
│ 8 mesas disponibles         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Restaurante Don José        │
│ 3 mesas disponibles         │
└─────────────────────────────┘
```

---

# 6. Autenticación

La autenticación se realiza mediante JWT.

## Flujo

```text
Frontend
    │
    │ email + password
    ▼
POST /api/login
    │
    ▼
API
    │
    │ JWT
    ▼
Frontend
    │
    │ Authorization: Bearer <token>
    ▼
Endpoints privados
```

Para una solicitud autenticada:

```http
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

El frontend no deberá enviar la contraseña en solicitudes posteriores.

---

# 7. Consumo de la API

El frontend deberá centralizar la comunicación HTTP con la API.

Se recomienda utilizar un cliente HTTP independiente para evitar realizar solicitudes directamente desde cada componente.

Conceptualmente:

```text
Componente
     │
     ▼
API Client
     │
     ▼
HTTP Request
     │
     ▼
API REST
```

Por ejemplo:

```text
api/
├── auth
├── restaurant
└── tables
```

Esto evita repetir código.

---

# 8. Arquitectura del Frontend

El proyecto deberá separar las responsabilidades de presentación, lógica de interfaz y comunicación con la API.

Conceptualmente:

```text
┌───────────────────────────────┐
│           Views               │
│       / Components            │
│                               │
│ Interfaz gráfica              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       State / Logic           │
│                               │
│ Estado de usuario             │
│ Estado de formularios         │
│ Loading / Error / Data        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          API Client           │
│                               │
│ HTTP / JSON                   │
│ JWT                           │
└───────────────┬───────────────┘
                │
                ▼
              API
```

El objetivo es evitar componentes que contengan simultáneamente:

- HTML/UI.
- solicitudes HTTP.
- lógica de negocio.
- manejo de autenticación.
- validaciones complejas.

---

# 9. Estructura del Proyecto

La estructura concreta dependerá del framework seleccionado.

Como referencia:

```text
frontend-web/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── RestaurantCard
│   │   ├── TableCard
│   │   ├── TableForm
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Login
│   │   ├── Dashboard
│   │   ├── Restaurant
│   │   ├── Tables
│   │   └── PublicRestaurants
│   │
│   ├── services/
│   │   ├── api
│   │   ├── auth
│   │   ├── restaurant
│   │   └── tables
│   │
│   ├── store/
│   │   └── ...
│   │
│   ├── router/
│   │   └── ...
│   │
│   ├── types/
│   │   └── ...
│   │
│   └── main
│
├── .env
├── .env.example
├── package.json
└── README.md
```

Esta estructura es orientativa y podrá modificarse según el framework utilizado.

---

# 10. Manejo de Estados

El frontend deberá distinguir diferentes estados de una solicitud.

### Loading

Mientras se espera una respuesta:

```text
Cargando mesas...
```

### Success

Cuando la solicitud es correcta:

```text
Mesa actualizada correctamente.
```

### Error

Cuando la API devuelve un error:

```text
No fue posible actualizar la mesa.
```

Ejemplo:

```text
API
 │
 ├── 200 → Actualizar interfaz
 │
 ├── 401 → Sesión inválida
 │
 ├── 403 → Sin permisos
 │
 ├── 404 → Recurso inexistente
 │
 ├── 422 → Mostrar errores de validación
 │
 └── 500 → Mostrar error general
```

---

# 11. Validaciones y Errores

El frontend deberá realizar validaciones básicas para mejorar la experiencia del usuario.

Por ejemplo:

```text
Nombre:
    requerido

Teléfono:
    formato válido

Cantidad de sillas:
    número entero
    mayor que 0
```

Sin embargo:

> **Las validaciones del frontend no reemplazan las validaciones de la API.**

El backend siempre deberá volver a validar los datos recibidos.

### Ejemplo

```text
Frontend
   │
   │ "cantidad_sillas": -5
   ▼
Validación frontend
   │
   └── Detecta error
```

Pero si el frontend es manipulado:

```text
Cliente malicioso
       │
       ▼
API
       │
       ▼
Validación backend
       │
       └── Rechaza el dato
```

---

# 12. Seguridad

El frontend deberá contemplar:

- No almacenar contraseñas.
- No mostrar información sensible.
- Utilizar HTTPS en producción.
- Enviar JWT únicamente cuando corresponda.
- Manejar correctamente sesiones expiradas.
- No confiar en las validaciones del frontend.
- Evitar insertar directamente contenido HTML proveniente de usuarios.
- Configurar correctamente la URL de la API mediante variables de entorno.

### Variables de entorno

Ejemplo:

```env
VITE_API_URL=http://localhost:8000/api
```

No se deberán colocar URLs específicas de producción directamente en el código fuente.

---

# 13. Requisitos No Funcionales

### RNF-WEB-01 — Usabilidad

La interfaz deberá ser sencilla e intuitiva.

### RNF-WEB-02 — Responsive Design

La aplicación deberá adaptarse a diferentes tamaños de pantalla.

### RNF-WEB-03 — Separación de responsabilidades

Los componentes visuales deberán mantenerse separados de la comunicación con la API.

### RNF-WEB-04 — Manejo de errores

Los errores provenientes de la API deberán comunicarse claramente al usuario.

### RNF-WEB-05 — Estados de carga

Las operaciones asíncronas deberán mostrar un estado de carga apropiado.

### RNF-WEB-06 — Accesibilidad

Los controles deberán contar con etiquetas y comportamientos adecuados para facilitar su utilización.

### RNF-WEB-07 — Configuración

La URL de la API deberá poder configurarse mediante variables de entorno.

### RNF-WEB-08 — Independencia

El frontend deberá funcionar como cliente independiente de la API y no deberá acceder directamente a la base de datos.

---

# 14. Etapas de Desarrollo

- [ ] **Etapa 1 — Inicialización:** Crear proyecto, configurar Git y estructura.
- [ ] **Etapa 2 — Diseño:** Wireframes y definición de componentes.
- [ ] **Etapa 3 — API Client:** Configurar cliente HTTP y variables de entorno.
- [ ] **Etapa 4 — Autenticación:** Login, JWT, sesión y rutas protegidas.
- [ ] **Etapa 5 — Dashboard:** Información general del restaurante.
- [ ] **Etapa 6 — Restaurante:** Consulta y edición.
- [ ] **Etapa 7 — Mesas:** CRUD completo.
- [ ] **Etapa 8 — Estados:** Implementar cambio rápido de estado.
- [ ] **Etapa 9 — Vista pública:** Restaurantes ordenados por disponibilidad.
- [ ] **Etapa 10 — Manejo de errores:** Loading, errores HTTP y validaciones.
- [ ] **Etapa 11 — Responsive:** Adaptación a diferentes resoluciones.
- [ ] **Etapa 12 — Testing:** Pruebas de integración con la API.
- [ ] **Etapa 13 — Documentación:** Completar README y documentación técnica.

---

# 15. Diferencias con el Frontend Mobile

El sistema contará posteriormente con un segundo cliente desarrollado para dispositivos móviles.

Ambos clientes utilizarán la misma API:

```text
                    ┌──────────────┐
                    │     API      │
                    └───────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌──────────────┐
       │  Web Client  │           │ Mobile Client│
       │              │           │              │
       │ Navegador    │           │ Android      │
       └──────────────┘           └──────────────┘
```

La información y las reglas de negocio deberán mantenerse en la API.

Por lo tanto:

> Si una mesa cambia de estado desde el frontend web, el frontend mobile podrá consultar posteriormente ese mismo estado mediante la API.


# 📚 Documentación relacionada

Para comprender el funcionamiento completo del sistema, consultar el README del repositorio de la **API Mesas Disponibles**.

Este repositorio documenta exclusivamente el funcionamiento y desarrollo del **cliente Web**.