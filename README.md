
# 🎬 NetStream - Plataforma de Descubrimiento de Media

**NetStream** es una aplicación web moderna para explorar y descubrir películas y series de televisión. Funciona con uso de la API externa de [TheTVDB](https://github.com/thetvdb/v4-api), proporcionando una experiencia fluida, responsiva y atractiva para el usuario.

---

## 🚀 Características Principales

- 🔍 **Exploración y búsqueda** de contenido multimedia por categorías
- 🎲 **Recomendaciones aleatorias** de películas y series
- 📱 **Diseño responsivo**, compatible con móviles y escritorios
- 📄 **Vistas detalladas** con información completa de cada título
- ⚡ **Interfaz fluida y rápida** con tecnologías modernas

---

## 🏗️ Arquitectura del Sistema

La aplicación sigue una arquitectura desacoplada frontend/backend:

- **Frontend**: SPA en Vue 3 + TypeScript, compilada con Vite
- **Backend**: Node.js con Fastify actuando como proxy API inteligente
- **API Externa**: TheTVDB como fuente de datos principal

---

## 🛠️ Stack Tecnológico

### 🔧 Frontend
- [Vue 3](https://vuejs.org/) con Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/) para gestión de estado
- [Vue Router](https://router.vuejs.org/) para enrutamiento
- [Axios](https://axios-http.com/) para llamadas HTTP
- [Vite](https://vitejs.dev/) como bundler moderno

### 🧰 Backend
- [Node.js] + Fastify
- [SQLite - Turso](https://turso.tech/) como base de datos
- Cache y autenticación de tokens para la API de TheTVDB

---

## 📦 Instalación y Configuración

### 🔁 Prerrequisitos
- PHP 8.2 o superior
- Node.js 18 o superior
- Composer

---

### ⚙️ Backend

```bash
# Instalar dependencias
cd backend
npm install

# Copiar archivo de entorno
cp .env.example .env

```

**Configurar credenciales de TheTVDB** en `.env`:

```env frontend
TVDB_API_KEY=tu_api_key
TVDB_PIN=tu_pin
```

```env backend
TURSO_DB_URL=tu_turso_db
TURSO_DB_TOKEN=tu_turso_token
```

```bash
# Iniciar servidor de desarrollo
php artisan serve
```

---

### 🖼️ Frontend

```bash
# Instalar dependencias
cd frontend
npm install

# Iniciar servidor de desarrollo
npm run dev
```

> El frontend está preconfigurado para utilizar un proxy hacia el backend.

---

## 🗂️ Estructura del Proyecto

```
NetStream_Grupal/
├── backend/           # API Node.js
│   ├── index.js
│   └── ...
├── frontend/          # SPA Vue 3
│   ├── src/
│   │   ├── components/   # Componentes Vue
│   │   ├── views/        # Vistas principales
│   │   ├── stores/       # Gestión de estado (Pinia)
│   │   ├── services/     # Comunicación con backend
│   │   ├── types/        # Definiciones TypeScript
│   │   └── router/       # Configuración de rutas
└── README.md
```

---

## 🎯 Funcionalidades Clave

- 🔁 **Proxy API Node.js**: Gestión de autenticación y cache hacia TheTVDB
- 🧠 **Gestión de estado con Pinia**: Búsquedas, contenido aleatorio y favoritos
- 🧩 **Componentes Vue modulares**: Reutilizables y fáciles de mantener

---

## 🚀 Scripts de Desarrollo

### Frontend y Backend

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run type-check   # Verificación de tipos
```
