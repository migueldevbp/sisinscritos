# Guía paso a paso — Conectar Google Sheets y desplegar en GitHub Pages

Sigue estos pasos **en orden**. Tarda unos 15–20 minutos la primera vez.

---

## PARTE A: Configurar Google Sheets (backend)

### Paso A1 — Crear la hoja de cálculo

1. Abre tu navegador y entra a: **https://sheets.google.com**
2. Haz clic en **+ En blanco** para crear una hoja nueva.
3. Arriba a la izquierda, cambia el nombre a: `STARTEC 2026 Inscripciones`
4. Deja la hoja abierta (no necesitas escribir nada manualmente; el script crea las columnas solo).

---

### Paso A2 — Abrir Apps Script

1. En la hoja, menú superior: **Extensiones → Apps Script**
2. Se abrirá una pestaña nueva con el editor de código.
3. Verás un archivo `Código.gs` con algo como `function myFunction() { ... }`
4. **Selecciona todo** ese código (Ctrl+A / Cmd+A) y **bórralo**.

---

### Paso A3 — Pegar el código del backend

1. En tu computadora, abre el archivo del proyecto:
   ```
   web_recibos/google-apps-script/Code.gs
   ```
2. Copia **todo** el contenido (Ctrl+A, Ctrl+C).
3. Pégalo en el editor de Apps Script (donde borraste el código anterior).
4. Guarda con el ícono de disquete o **Ctrl+S / Cmd+S**.
5. Arriba, donde dice "Proyecto sin título", cámbialo a: `STARTEC Backend`

---

### Paso A4 — Autorizar el script (primera vez)

1. En Apps Script, arriba selecciona la función `doGet` en el desplegable.
2. Haz clic en **Ejecutar** (▶).
3. Te pedirá permisos:
   - Clic en **Revisar permisos**
   - Elige tu cuenta de Google
   - Si dice "Google no verificó esta app" → **Configuración avanzada** → **Ir a STARTEC Backend (no seguro)**
   - Clic en **Permitir**
4. Si aparece un error en rojo la primera vez, no te preocupes; lo importante es que autorizaste.

---

### Paso A5 — Desplegar como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**
2. Clic en el ícono de engranaje ⚙ junto a "Seleccionar tipo" → elige **Aplicación web**
3. Configura exactamente así:

   | Campo | Valor |
   |-------|-------|
   | Descripción | `STARTEC API v1` |
   | Ejecutar como | **Yo** (tu correo de Google) |
   | Quién tiene acceso | **Cualquier persona** |

4. Clic en **Implementar**
5. Si pide autorizar de nuevo, repite el Paso A4.
6. **MUY IMPORTANTE:** Copia la **URL de la aplicación web**.
   - Debe verse así: `https://script.google.com/macros/s/AKfycb.............../exec`
   - Usa la que termina en **`/exec`** (NO la que termina en `/dev`)

7. Guarda esa URL en un bloc de notas. La necesitarás en el Paso B.

---

### Paso A6 — Probar que el backend funciona

Abre esta URL en el navegador (reemplaza `TU_URL` con la que copiaste):

```
TU_URL?action=list
```

**Resultado esperado** (algo como esto):

```json
{"success":true,"data":[],"stats":{"total":0,"ingresos":0,"cancelados":0,"adelantados":0}}
```

Si ves eso, ¡el backend está listo! ✅

**Si no funciona:**
- Verifica que la URL termine en `/exec`
- Verifica que "Quién tiene acceso" sea **Cualquier persona**
- Crea una **nueva implementación** (Implementar → Administrar implementaciones → ✏️ → Nueva versión → Implementar)

---

## PARTE B: Conectar la web con Google Sheets

### Paso B1 — Pegar la URL en la configuración

1. Abre el archivo: `js/config.js`
2. Busca esta línea:
   ```js
   API_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI',
   ```
3. Reemplázala con tu URL real, por ejemplo:
   ```js
   API_URL: 'https://script.google.com/macros/s/AKfycbXXXXXXXX/exec',
   ```
4. Guarda el archivo.

---

### Paso B2 — Probar en local (opcional)

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:
   ```bash
   python3 -m http.server 8080
   ```
3. Abre en el navegador: **http://localhost:8080**
4. Inicia sesión con:
   - Usuario: `luigi` → Contraseña: `luigi2026`
5. Prueba registrar una persona de prueba.
6. Vuelve a tu Google Sheet: deberías ver la fila nueva con todos los datos.

---

## PARTE C: Desplegar en GitHub Pages

### Paso C1 — Crear repositorio en GitHub

1. Entra a **https://github.com** e inicia sesión.
2. Clic en **+** (arriba derecha) → **New repository**
3. Configura:
   - **Repository name:** `sisinscritos` ✅ (ya creado)
   - **Public** ✅
   - NO marques "Add a README" (ya tienes archivos locales)
4. Clic en **Create repository**
5. Tu repositorio ya está creado: `https://github.com/migueldevbp/sisinscritos`

---

### Paso C2 — Subir el código desde tu computadora

En la terminal, dentro de la carpeta `web_recibos`:

```bash
cd /Users/miguelborja/Documents/web_recibos

git init
git add .
git commit -m "Sistema de inscripciones STARTEC 2026"
git branch -M main
git remote add origin https://github.com/migueldevbp/sisinscritos.git
git push -u origin main
```

> ✅ Este paso ya está hecho — el código ya está subido.

Te pedirá usuario y contraseña de GitHub (o token de acceso personal).

---

### Paso C3 — Activar GitHub Pages

1. En GitHub, entra a tu repositorio.
2. Pestaña **Settings** (Configuración).
3. Menú izquierdo: **Pages**.
4. En **Source / Build and deployment**:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Clic en **Save**.
6. Espera 1–3 minutos. Recarga la página.
7. Verás un enlace verde: **`https://migueldevbp.github.io/sisinscritos/`**

¡Esa es la URL pública de tu sistema! 🎉

---

### Paso C4 — Probar el sitio publicado

1. Abre la URL de GitHub Pages.
2. Inicia sesión (luigi / luigi2026).
3. Registra un inscrito de prueba.
4. Abre la hoja de Google Sheets y confirma que apareció el registro.
5. Abre la web en otro celular o navegador con otro usuario (miguel) y verifica que el contador se actualiza.

---

## Resumen visual del flujo

```
[Navegador / GitHub Pages]          [Google Apps Script]          [Google Sheets]
        │                                    │                            │
        │  GET ?action=list                  │                            │
        ├───────────────────────────────────►│  Lee/escribe filas         │
        │                                    ├───────────────────────────►│
        │                                    │                            │
        │  GET ?action=add&data={...}        │  Agrega nueva fila         │
        ├───────────────────────────────────►├───────────────────────────►│
        │                                    │                            │
        │  Respuesta JSON ◄──────────────────┤                            │
        │                                    │                            │
```

Los 3 usuarios (luigi, miguel, marlene) ven los mismos datos porque todos leen la misma hoja.

---

## Contraseñas de acceso

| Usuario | Contraseña |
|---------|------------|
| luigi | `luigi2026` |
| miguel | `miguel2026` |
| marlene | `marlene2026` |

Para cambiarlas, edita **dos archivos**:
1. `js/config.js` → sección `USUARIOS`
2. `google-apps-script/Code.gs` → constante `USUARIOS`

Después de cambiar el Apps Script, crea una **nueva implementación** (Paso A5).

---

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| "Configura la URL de Google Apps Script" | Falta pegar la URL en `js/config.js` |
| Error al guardar inscripción | Revisa que la URL termine en `/exec` y acceso sea "Cualquier persona" |
| La hoja no se crea sola | Ejecuta `doGet` una vez en Apps Script o abre `TU_URL?action=list` |
| DNI duplicado | Es correcto: no permite inscribir dos veces al mismo DNI |
| GitHub Pages no carga | Espera 3 min y verifica que `.nojekyll` esté en el repo |
| Cambié el script y no funciona | Implementar → Administrar → Nueva versión → Implementar |

---

## Contacto rápido de verificación

Cuando todo esté bien configurado, estas 3 cosas deben funcionar:

- [ ] `TU_URL?action=list` devuelve JSON con `"success":true`
- [ ] Al inscribir alguien, aparece una fila en Google Sheets
- [ ] La URL de GitHub Pages abre el login de STARTEC 2026
