const API = {
  buildUrl(action, params = {}, withCallback) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);
    if (withCallback) url.searchParams.set('callback', withCallback);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : v);
    });
    return url.toString();
  },

  async request(action, params = {}) {
    if (!CONFIG.API_URL || CONFIG.API_URL.includes('TU_URL')) {
      throw new Error('URL del backend no configurada. Recarga la página (Ctrl+Shift+R).');
    }

    try {
      return await this.fetchJson(action, params);
    } catch (err) {
      const msg = err.message || '';
      const isNetwork = err instanceof TypeError ||
        msg.includes('Failed to fetch') ||
        msg === 'PERMISO' ||
        msg.includes('Respuesta inválida');
      if (!isNetwork) throw err;
      return await this.jsonp(action, params);
    }
  },

  async fetchJson(action, params) {
    const res = await fetch(this.buildUrl(action, params), {
      method: 'GET',
      redirect: 'follow'
    });
    const text = await res.text();
    if (text.includes('accounts.google.com') || text.includes('<!DOCTYPE')) {
      throw new Error('PERMISO');
    }
    const data = JSON.parse(text);
    if (!data.success) throw new Error(data.error || 'Error del servidor');
    return data;
  },

  jsonp(action, params) {
    return new Promise((resolve, reject) => {
      const cb = '_st_' + Date.now();
      let script = null;

      const cleanup = () => {
        clearTimeout(timer);
        delete window[cb];
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Tiempo de espera agotado. Verifica la conexión.'));
      }, 30000);

      window[cb] = (data) => {
        cleanup();
        if (!data || !data.success) {
          reject(new Error((data && data.error) || 'Error del servidor'));
        } else {
          resolve(data);
        }
      };

      script = document.createElement('script');
      script.src = this.buildUrl(action, params, cb);
      script.onerror = () => {
        cleanup();
        reject(new Error(
          'Actualiza el código en Apps Script y crea Nueva versión. ' +
          'Copia google-apps-script/Code.gs completo e Implementar de nuevo.'
        ));
      };
      document.head.appendChild(script);
    });
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

  completarPago(id) {
    return this.request('complete', { id });
  },

  stats() {
    return this.request('stats');
  }
};
