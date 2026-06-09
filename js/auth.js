const Auth = {
  SESSION_KEY: 'startec_session',

  login(username, password) {
    const user = CONFIG.USUARIOS[username];
    if (!user || user.password !== password) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
    const session = {
      username,
      nombre: user.nombre,
      loginAt: Date.now()
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  getSession() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  getCurrentUser() {
    return this.getSession();
  }
};
