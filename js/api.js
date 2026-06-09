const API = {
  request(action, params = {}) {
    return new Promise((resolve, reject) => {
      if (!CONFIG.API_URL || CONFIG.API_URL.includes('TU_URL')) {
        reject(new Error('URL del backend no configurada. Recarga la página (Ctrl+Shift+R).'));
        return;
      }

      const callbackName = '_startec_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      let script = null;

      const cleanup = () => {
        clearTimeout(timer);
        delete window[callbackName];
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Tiempo de espera agotado. Verifica tu conexión.'));
      }, 30000);

      window[callbackName] = (data) => {
        cleanup();
        if (!data || !data.success) {
          reject(new Error((data && data.error) || 'Error del servidor'));
        } else {
          resolve(data);
        }
      };

      const url = new URL(CONFIG.API_URL);
      url.searchParams.set('action', action);
      url.searchParams.set('callback', callbackName);
      Object.entries(params).forEach(([k, v]) => {
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });

      script = document.createElement('script');
      script.src = url.toString();
      script.onerror = () => {
        cleanup();
        reject(new Error('No se pudo conectar con Google Sheets. Verifica que Apps Script tenga acceso "Cualquier persona".'));
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

  stats() {
    return this.request('stats');
  }
};
