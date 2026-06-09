/**
 * STARTEC 2026 — Backend Google Apps Script
 *
 * INSTRUCCIONES:
 * 1. Crea una hoja de Google Sheets nueva
 * 2. Ve a Extensiones > Apps Script y pega este código
 * 3. Cambia SHEET_NAME si tu hoja tiene otro nombre
 * 4. Despliega como Web App:
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier persona
 * 5. Copia la URL generada y pégala en js/config.js
 */

const SPREADSHEET_ID = '1ksOyZlplM5NwluCq1lloJUAmMCve_jnuvYuIu-8M8R4';
const SHEET_NAME = 'Inscripciones';
const EVENTO_COSTO = 50;

const USUARIOS = {
  luigi:   'luigi2026',
  miguel:  'miguel2026',
  marlene: 'marlene2026'
};

const HEADERS = [
  'ID', 'Fecha', 'Nombre', 'Apellidos', 'DNI', 'Telefono',
  'Monto', 'Estado', 'Saldo', 'RegistradoPor'
];

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = (params.action || '').toLowerCase();

  try {
    let result;
    switch (action) {
      case 'login':
        result = actionLogin(params.user, params.pass);
        break;
      case 'list':
        result = actionList();
        break;
      case 'add':
        result = actionAdd(params.data);
        break;
      case 'complete':
        result = actionComplete(params.id);
        break;
      case 'stats':
        result = actionStats();
        break;
      default:
        result = { success: false, error: 'Acción no válida: ' + action };
    }
    return jsonResponse(result, params.callback);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, params.callback);
  }
}

/**
 * Ejecuta esta función desde el editor (▶) para crear la hoja y verificar permisos.
 * NO uses doGet con Ejecutar — doGet solo funciona desplegado como Web App.
 */
function testSetup() {
  const sheet = getSheet();
  const result = actionList();
  Logger.log('Hoja creada: ' + sheet.getName());
  Logger.log('Inscritos: ' + result.stats.total);
  return result;
}

function jsonResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    const safeCallback = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
    return ContentService
      .createTextOutput(safeCallback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1a3a6b')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function actionLogin(user, pass) {
  if (!user || !pass) {
    return { success: false, error: 'Usuario y contraseña requeridos' };
  }
  const expected = USUARIOS[user.toLowerCase()];
  if (!expected || expected !== pass) {
    return { success: false, error: 'Credenciales incorrectas' };
  }
  return { success: true, user: user };
}

function getAllRows() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1).map(row => ({
    id: row[0],
    fecha: row[1] ? formatDate(row[1]) : '',
    nombre: row[2],
    apellidos: row[3],
    dni: String(row[4]),
    telefono: String(row[5]),
    monto: parseFloat(row[6]) || 0,
    estado: row[7],
    saldo: parseFloat(row[8]) || 0,
    registradoPor: row[9]
  })).filter(r => r.nombre);
}

function formatDate(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, 'America/Lima', "yyyy-MM-dd'T'HH:mm:ss");
  }
  return String(date);
}

function calcStats(rows) {
  return {
    total: rows.length,
    ingresos: rows.reduce((s, r) => s + r.monto, 0),
    cancelados: rows.filter(r => r.estado === 'cancelado').length,
    adelantados: rows.filter(r => r.estado === 'adelantado').length
  };
}

function actionList() {
  const rows = getAllRows();
  return { success: true, data: rows, stats: calcStats(rows) };
}

function actionStats() {
  const rows = getAllRows();
  return { success: true, stats: calcStats(rows) };
}

function actionAdd(dataJson) {
  if (!dataJson) {
    return { success: false, error: 'Datos de inscripción requeridos' };
  }

  let data;
  try {
    data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
  } catch (e) {
    return { success: false, error: 'JSON inválido' };
  }

  const { nombre, apellidos, dni, telefono, monto, estado, registradoPor } = data;

  if (!nombre || !apellidos || !dni || !telefono || !monto || !estado) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }

  const sheet = getSheet();
  const existing = getAllRows();
  if (existing.some(r => String(r.dni) === String(dni))) {
    return { success: false, error: 'Ya existe una inscripción con ese DNI' };
  }

  const montoNum = parseFloat(monto);
  const saldo = Math.max(0, EVENTO_COSTO - montoNum);
  const lastId = existing.length > 0
    ? Math.max(...existing.map(r => Number(r.id) || 0))
    : 0;
  const newId = lastId + 1;
  const fecha = new Date();

  sheet.appendRow([
    newId,
    fecha,
    nombre.trim(),
    apellidos.trim(),
    String(dni).trim(),
    String(telefono).trim(),
    montoNum,
    estado,
    saldo,
    registradoPor || ''
  ]);

  const newRow = {
    id: newId,
    fecha: formatDate(fecha),
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    dni: String(dni).trim(),
    telefono: String(telefono).trim(),
    monto: montoNum,
    estado,
    saldo,
    registradoPor: registradoPor || ''
  };

  const allRows = existing.concat([newRow]);
  return { success: true, data: newRow, stats: calcStats(allRows) };
}

function actionComplete(id) {
  if (!id) {
    return { success: false, error: 'ID de inscripción requerido' };
  }

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, error: 'Inscripción no encontrada' };
  }

  const estadoActual = data[rowIndex - 1][7];
  if (estadoActual !== 'adelantado') {
    return { success: false, error: 'Esta inscripción ya está cancelada o no tiene adelanto' };
  }

  // Columnas: Monto=7, Estado=8, Saldo=9
  sheet.getRange(rowIndex, 7).setValue(EVENTO_COSTO);
  sheet.getRange(rowIndex, 8).setValue('cancelado');
  sheet.getRange(rowIndex, 9).setValue(0);

  const rows = getAllRows();
  const updated = rows.find(r => String(r.id) === String(id));
  return { success: true, data: updated, stats: calcStats(rows) };
}
