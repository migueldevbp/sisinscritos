const API = {
  async request(action, params = {}) {
    if (!CONFIG.API_URL || CONFIG.API_URL.includes('TU_URL')) {
      throw new Error('URL del backend no configurada. Recarga la página (Ctrl+Shift+R).');
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
