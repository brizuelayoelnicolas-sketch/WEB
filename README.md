# Hierro Progreso — Sitio + Base de datos (Neon) + Panel admin

## Estructura del proyecto
```
/
├── index.html          → sitio principal
├── styles.css          → estilos del sitio
├── script.js           → lógica del sitio (menú, FAQ, envío del formulario)
├── admin.html          → panel administrativo (ABM)
├── admin.css           → estilos del panel admin
├── admin.js            → lógica del panel admin (listar, buscar, editar, eliminar)
├── schema.sql          → script para crear las tablas en Neon + datos de prueba
├── package.json        → dependencia del driver de Neon
└── api/
    ├── _db.js          → conexión a Neon (usa DATABASE_URL)
    ├── contacto.js     → POST: guarda las consultas del formulario
    ├── consultas.js    → GET/PUT/DELETE: ABM de consultas (panel admin)
    └── clientes.js     → GET/DELETE: ABM de clientes (panel admin)
```

## Paso 1: crear la base en Neon
1. Entrá a https://neon.tech y creá un proyecto nuevo (o usá uno existente).
2. Abrí el **SQL Editor** de Neon.
3. Copiá y ejecutá todo el contenido de `schema.sql`. Esto crea las tablas
   `clientes` y `consultas`, con sus relaciones, y carga 4 clientes y 4 consultas
   de prueba.
4. Copiá la **connection string** que te da Neon (botón "Connect"), algo como:
   ```
   postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require
   ```

## Paso 2: subir el proyecto a Vercel
1. Subí esta carpeta a un repositorio de GitHub (o usá `vercel` CLI directo).
2. Importá el repo en https://vercel.com/new.
3. En **Settings → Environment Variables**, agregá:
   - `DATABASE_URL` = la connection string de Neon del paso anterior.
4. Hacé deploy. Vercel detecta automáticamente la carpeta `/api` como funciones
   serverless, no hace falta configurar nada extra ni levantar un servidor.

## Paso 3: probarlo
- El sitio queda en `https://tu-proyecto.vercel.app/`
- El panel admin queda en `https://tu-proyecto.vercel.app/admin.html`
- Completá el formulario de contacto del sitio y después abrí el panel admin:
  la consulta nueva va a aparecer en la pestaña "Consultas".

## Notas
- No se implementó ninguna capa de seguridad (sin login, sin protección de
  variables, sin validación de origen) porque el alcance del trabajo es
  académico/de prueba. Si en algún momento querés agregar un login básico al
  panel admin, avisame y lo sumamos.
- Si querés probar en tu computadora antes de deployar, necesitás Node.js
  instalado y correr `vercel dev` (con la CLI de Vercel) en la carpeta del
  proyecto, así las funciones de `/api` se simulan localmente.
