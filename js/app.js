const App = {
  inscritos: [],
  pollTimer: null,
  searchQuery: '',

  init() {
    this.bindEvents();
    if (Auth.isLoggedIn()) {
      this.showApp();
      this.startPolling();
    } else {
      this.showLogin();
    }
  },

  bindEvents() {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

    document.getElementById('btn-nueva-inscripcion').addEventListener('click', () => {
      document.getElementById('form-section').classList.remove('hidden');
      document.getElementById('nombre').focus();
    });

    document.getElementById('btn-close-form').addEventListener('click', () => this.closeForm());
    document.getElementById('btn-cancel-form').addEventListener('click', () => this.closeForm());

    document.getElementById('inscripcion-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleInscripcion();
    });

    document.getElementById('monto').addEventListener('change', () => this.updateSaldoPreview());
    document.getElementById('estado').addEventListener('change', () => this.updateSaldoPreview());

    document.getElementById('btn-refresh').addEventListener('click', () => this.loadData(true));
    document.getElementById('btn-resumen').addEventListener('click', () => this.showResumen());

    document.getElementById('search-input').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderTable();
    });

    document.getElementById('btn-print-recibo').addEventListener('click', () => window.print());
    document.getElementById('btn-print-resumen').addEventListener('click', () => window.print());

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => this.closeModals());
    });
  },

  showLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
  },

  showApp() {
    const session = Auth.getCurrentUser();
    document.getElementById('user-display').textContent = session.nombre;
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    this.loadData();
  },

  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    const result = Auth.login(username, password);
    if (!result.success) {
      errorEl.textContent = result.error;
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    this.showApp();
    this.startPolling();
    this.toast('Bienvenido, ' + result.session.nombre, 'success');
  },

  handleLogout() {
    this.stopPolling();
    Auth.logout();
    this.inscritos = [];
    this.showLogin();
    document.getElementById('login-form').reset();
  },

  closeForm() {
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('inscripcion-form').reset();
    document.getElementById('monto').value = '';
    document.getElementById('estado').value = 'cancelado';
    this.updateSaldoPreview();
  },

  updateSaldoPreview() {
    const montoVal = document.getElementById('monto').value;
    const el = document.getElementById('saldo-preview');

    if (!montoVal) {
      el.innerHTML = 'Seleccione el monto pagado';
      return;
    }

    const monto = parseFloat(montoVal);
    const saldo = Math.max(0, CONFIG.EVENTO.costo - monto);
    el.innerHTML = saldo > 0
      ? `Saldo pendiente: <strong>${Receipt.formatMoney(saldo)}</strong>`
      : `<strong style="color:#16a34a">✓ Pago completo — sin saldo pendiente</strong>`;
  },

  async handleInscripcion() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const montoVal = document.getElementById('monto').value;
    const estado = document.getElementById('estado').value;

    if (!/^\d{8}$/.test(dni)) {
      this.toast('El DNI debe tener exactamente 8 dígitos', 'error');
      return;
    }
    if (!/^\d{9}$/.test(telefono)) {
      this.toast('El teléfono debe tener 9 dígitos', 'error');
      return;
    }
    if (!montoVal) {
      this.toast('Seleccione el monto pagado', 'error');
      return;
    }
    const monto = parseFloat(montoVal);
    if (estado === 'cancelado' && monto < CONFIG.EVENTO.costo) {
      this.toast('Para estado "Cancelado" seleccione S/ 50.00', 'error');
      return;
    }
    if (estado === 'adelantado' && monto >= CONFIG.EVENTO.costo) {
      this.toast('Para estado "Adelantado" seleccione un monto menor a S/ 50.00', 'error');
      return;
    }

    const duplicado = this.inscritos.find(i => i.dni === dni);
    if (duplicado) {
      this.toast(`Ya existe una inscripción con DNI ${dni}`, 'warning');
      return;
    }

    const session = Auth.getCurrentUser();
    const data = {
      nombre, apellidos, dni, telefono,
      monto: monto.toFixed(2),
      estado,
      registradoPor: session.nombre
    };

    this.setLoading(true);
    try {
      await API.agregar(data);
      this.toast(`Inscripción de ${nombre} ${apellidos} guardada`, 'success');
      this.closeForm();
      await this.loadData(true);
    } catch (err) {
      this.toast(err.message, 'error');
    } finally {
      this.setLoading(false);
    }
  },

  async loadData(showToast = false) {
    try {
      const result = await API.listar();
      this.inscritos = result.data || [];
      this.updateStats(result.stats);
      this.renderTable();
      if (showToast) this.toast('Datos actualizados', 'success');
    } catch (err) {
      if (showToast) this.toast('Error al cargar: ' + err.message, 'error');
    }
  },

  updateStats(stats) {
    if (!stats) {
      const costo = CONFIG.EVENTO.costo;
      stats = {
        total: this.inscritos.length,
        ingresos: this.inscritos.reduce((s, i) => s + (parseFloat(i.monto) || 0), 0),
        cancelados: this.inscritos.filter(i => i.estado === 'cancelado').length,
        adelantados: this.inscritos.filter(i => i.estado === 'adelantado').length
      };
    }

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-ingresos').textContent = Receipt.formatMoney(stats.ingresos);
    document.getElementById('stat-cancelados').textContent = stats.cancelados;
    document.getElementById('stat-adelantados').textContent = stats.adelantados;
    document.getElementById('counter-text').textContent =
      `${stats.total} inscrito${stats.total !== 1 ? 's' : ''}`;
  },

  renderTable() {
    const tbody = document.getElementById('inscritos-tbody');
    const costo = CONFIG.EVENTO.costo;

    let filtered = this.inscritos;
    if (this.searchQuery) {
      filtered = this.inscritos.filter(i => {
        const full = `${i.nombre} ${i.apellidos}`.toLowerCase();
        return full.includes(this.searchQuery) ||
          i.dni.includes(this.searchQuery) ||
          i.telefono.includes(this.searchQuery);
      });
    }

    document.getElementById('table-count').textContent =
      `${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="9">${
        this.searchQuery ? 'No se encontraron resultados' : 'No hay inscritos aún. ¡Registra al primero!'
      }</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((i, idx) => {
      const monto = parseFloat(i.monto) || 0;
      const saldo = Math.max(0, costo - monto);
      const badgeClass = i.estado === 'cancelado' ? 'badge-cancelado' : 'badge-adelantado';
      const estadoLabel = i.estado === 'cancelado' ? 'Cancelado' : 'Adelantado';

      let acciones;
      if (i.estado === 'cancelado') {
        acciones = `<button class="btn-recibo" data-id="${i.id}">🧾 Recibo</button>`;
      } else {
        acciones = `<button class="btn-completar" data-id="${i.id}">✅ Completar pago</button>`;
      }

      return `<tr>
        <td>${i.id || idx + 1}</td>
        <td><strong>${i.nombre} ${i.apellidos}</strong></td>
        <td>${i.dni}</td>
        <td>${i.telefono}</td>
        <td>${Receipt.formatMoney(monto)}</td>
        <td><span class="badge ${badgeClass}">${estadoLabel}</span></td>
        <td>${saldo > 0 ? Receipt.formatMoney(saldo) : '—'}</td>
        <td style="text-transform:capitalize">${i.registradoPor || '—'}</td>
        <td class="td-acciones">${acciones}</td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-recibo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const inscrito = this.inscritos.find(i => String(i.id) === String(id));
        if (inscrito && inscrito.estado === 'cancelado') this.showRecibo(inscrito);
      });
    });

    tbody.querySelectorAll('.btn-completar').forEach(btn => {
      btn.addEventListener('click', () => this.completarPago(btn.dataset.id));
    });
  },

  async completarPago(id) {
    const inscrito = this.inscritos.find(i => String(i.id) === String(id));
    if (!inscrito || inscrito.estado !== 'adelantado') return;

    const monto = parseFloat(inscrito.monto) || 0;
    const saldo = CONFIG.EVENTO.costo - monto;
    const nombre = `${inscrito.nombre} ${inscrito.apellidos}`;

    const ok = confirm(
      `¿Confirmar pago completo de ${nombre}?\n\n` +
      `Ya pagó: ${Receipt.formatMoney(monto)}\n` +
      `Saldo restante: ${Receipt.formatMoney(saldo)}\n\n` +
      `Se marcará como CANCELADO (S/ 50.00) y podrá generar el recibo.`
    );
    if (!ok) return;

    this.setLoading(true);
    try {
      await API.completarPago(id);
      this.toast(`${nombre} — pago completado. Ya puede generar el recibo.`, 'success');
      await this.loadData();
    } catch (err) {
      this.toast(err.message, 'error');
    } finally {
      this.setLoading(false);
    }
  },

  showRecibo(inscrito) {
    if (inscrito.estado !== 'cancelado') {
      this.toast('El recibo solo está disponible cuando el pago está cancelado (completo)', 'warning');
      return;
    }
    document.getElementById('recibo-body').innerHTML = Receipt.generate(inscrito);
    document.getElementById('modal-recibo').classList.remove('hidden');
  },

  showResumen() {
    const costo = CONFIG.EVENTO.costo;
    const stats = {
      total: this.inscritos.length,
      ingresos: this.inscritos.reduce((s, i) => s + (parseFloat(i.monto) || 0), 0),
      cancelados: this.inscritos.filter(i => i.estado === 'cancelado').length,
      adelantados: this.inscritos.filter(i => i.estado === 'adelantado').length
    };
    document.getElementById('resumen-body').innerHTML =
      Receipt.generateResumen(stats, this.inscritos);
    document.getElementById('modal-resumen').classList.remove('hidden');
  },

  closeModals() {
    document.getElementById('modal-recibo').classList.add('hidden');
    document.getElementById('modal-resumen').classList.add('hidden');
  },

  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.loadData(), CONFIG.POLL_INTERVAL);
  },

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },

  setLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
  },

  toast(message, type = '') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
