const CONFIG = {
  // URL del Google Apps Script desplegado como Web App
  // Reemplaza con tu URL después de configurar Google Sheets (ver README.md)
  API_URL: 'https://script.google.com/macros/s/AKfycbxeX90JhEl8thARsdoaql0-UzERJ_0ZdB2MBmMubeQyb-KPtKl6v-2CmkUPf3WJgdSobw/exec',

  EVENTO: {
    nombre: 'Ier Congreso Nacional de Investigación, Innovación y Emprendimiento STARTEC 2026',
    institucion: 'Instituto de Educación Superior Tecnológico Público Pasco',
    siglas: 'IESPASCO',
    costo: 50.00,
    moneda: 'PEN'
  },

  USUARIOS: {
    luigi:   { password: 'luigi2026',   nombre: 'Luigi' },
    miguel:  { password: 'miguel2026',  nombre: 'Miguel' },
    marlene: { password: 'marlene2026', nombre: 'Marlene' }
  },

  // Intervalo de actualización en tiempo real (milisegundos)
  POLL_INTERVAL: 8000
};
