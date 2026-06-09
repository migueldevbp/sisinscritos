const API = {
  async request(action, params = {}) {
    if (CONFIG.API_URL === 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
      throw new Error('Configura la URL de Google Apps Script en js/config.js');
    }

    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : v);
    });

    const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Respuesta inválida del servidor. Verifica la URL de Apps Script.');
    }

    if (!data.success) {
      throw new Error(data.error || 'Error desconocido del servidor');
    }
    return data;
  },

  login(user, pass) {
    return this.request('login', { user, pass });
  },

  listar() {
    return this.request('list');
  },

  agregar(inscripcion) {
    return this.request('add', { data: inscripcion });
  },

  stats() {
    return this.request('stats');
  }
};
