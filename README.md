# STARTEC 2026 — Sistema de Inscripciones

Sistema web para el **Ier Congreso Nacional de Investigación, Innovación y Emprendimiento STARTEC 2026** del **IESPASCO** (Instituto de Educación Superior Tecnológico Público Pasco).

Permite inscribir participantes, registrar pagos (adelantado o cancelado), ver estadísticas en tiempo real y generar recibos imprimibles. Los datos se almacenan en **Google Sheets**.

---

## Características

- Login para 3 usuarios: **luigi**, **miguel**, **marlene**
- Inscripción con: nombres, apellidos, DNI, teléfono, monto y estado de pago
- Costo del evento: **S/ 50.00**
- Contador en tiempo real de inscritos (se actualiza cada 8 segundos)
- Generación de recibos imprimibles por cada inscrito
- Resumen de ingresos totales con desglose
- Búsqueda por nombre, DNI o teléfono
- Validación de DNI duplicado

---

## Paso 1: Configurar Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com) y crea una hoja nueva.
2. Nómbrala algo como `STARTEC 2026 Inscripciones`.
3. Ve a **Extensiones → Apps Script**.
4. Borra el código existente y pega el contenido de `google-apps-script/Code.gs`.
5. Guarda el proyecto (Ctrl+S) con el nombre `STARTEC Backend`.
6. Haz clic en **Implementar → Nueva implementación**.
7. Configura:
   - **Tipo:** Aplicación web
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier persona
8. Haz clic en **Implementar** y autoriza los permisos.
9. **Copia la URL** que termina en `/exec` (no uses la que termina en `/dev`).

---

## Paso 2: Configurar la web

Abre `js/config.js` y reemplaza la URL:

```js
API_URL: 'https://script.google.com/macros/s/TU_ID_AQUI/exec',
```

### Contraseñas por defecto

| Usuario  | Contraseña    |
|----------|---------------|
| luigi    | `luigi2026`   |
| miguel   | `miguel2026`  |
| marlene  | `marlene2026` |

Para cambiarlas, edita `js/config.js` (frontend) y `google-apps-script/Code.gs` (backend), luego vuelve a desplegar el Apps Script.

---

## Paso 3: Subir a GitHub Pages

1. Crea un repositorio en GitHub (ej: `startec-inscripciones`).
2. Sube todos los archivos del proyecto.
3. Ve a **Settings → Pages**.
4. En **Source**, selecciona la rama `main` y carpeta `/ (root)`.
5. Guarda. En unos minutos tu web estará en:
   `https://TU_USUARIO.github.io/startec-inscripciones/`

---

## Estructura del proyecto

```
web_recibos/
├── index.html              # Página principal
├── css/styles.css          # Estilos
├── js/
│   ├── config.js           # Configuración (URL API, usuarios, evento)
│   ├── api.js              # Comunicación con Google Sheets
│   ├── auth.js             # Autenticación de sesión
│   ├── receipt.js          # Generación de recibos
│   └── app.js              # Lógica principal
├── google-apps-script/
│   └── Code.gs             # Backend para Google Sheets
├── .nojekyll               # Necesario para GitHub Pages
└── README.md
```

---

## Columnas en Google Sheets

| Columna        | Descripción                        |
|----------------|------------------------------------|
| ID             | Número secuencial automático       |
| Fecha          | Fecha y hora de inscripción        |
| Nombre         | Nombres del participante           |
| Apellidos      | Apellidos                          |
| DNI            | Documento de identidad (8 dígitos) |
| Telefono       | Número de celular (9 dígitos)      |
| Monto          | Monto pagado en soles              |
| Estado         | `cancelado` o `adelantado`         |
| Saldo          | Saldo pendiente (50 - monto)       |
| RegistradoPor  | Usuario que registró la inscripción|

---

## Notas importantes

- Los tres usuarios ven los mismos datos en tiempo real porque comparten la misma hoja de Google Sheets.
- Si actualizas el código de Apps Script, debes crear una **nueva implementación** para que los cambios surtan efecto.
- La hoja de Google Sheets también sirve como respaldo: puedes exportarla a Excel en cualquier momento.
- Para uso en producción, cambia las contraseñas por defecto.

---

## Soporte

Desarrollado para el IESPASCO — STARTEC 2026.
