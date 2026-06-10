const Receipt = {
  formatMoney(amount) {
    return `S/ ${Number(amount).toFixed(2)}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  },

  generate(inscrito) {
    const costo = CONFIG.EVENTO.costo;
    const monto = parseFloat(inscrito.monto) || 0;
    const saldo = Math.max(0, costo - monto);
    let estadoLabel = 'PAGO ADELANTADO';
    if (inscrito.estado === 'estudiante') estadoLabel = 'ESTUDIANTE - IESPASCO';
    else if (inscrito.estado === 'cancelado') estadoLabel = 'PAGO COMPLETO';

    return `
      <div class="recibo" id="recibo-print">
        <div class="recibo-header">
          <div class="recibo-inst">${CONFIG.EVENTO.siglas}</div>
          <h2>${CONFIG.EVENTO.nombre}</h2>
          <p>${CONFIG.EVENTO.institucion}</p>
        </div>
        <div class="recibo-body">
          <div class="recibo-num">RECIBO N° ${String(inscrito.id).padStart(4, '0')}</div>
          <div class="recibo-row">
            <span class="label">Fecha de inscripción</span>
            <span class="value">${this.formatDate(inscrito.fecha)}</span>
          </div>
          <div class="recibo-row">
            <span class="label">Nombres y apellidos</span>
            <span class="value">${inscrito.nombre} ${inscrito.apellidos}</span>
          </div>
          <div class="recibo-row">
            <span class="label">DNI</span>
            <span class="value">${inscrito.dni}</span>
          </div>
          <div class="recibo-row">
            <span class="label">Teléfono</span>
            <span class="value">${inscrito.telefono}</span>
          </div>
          <div class="recibo-row">
            <span class="label">Costo del evento</span>
            <span class="value">${this.formatMoney(costo)}</span>
          </div>
          <div class="recibo-row">
            <span class="label">Monto pagado</span>
            <span class="value">${this.formatMoney(monto)}</span>
          </div>
          ${saldo > 0 ? `
          <div class="recibo-row">
            <span class="label">Saldo pendiente</span>
            <span class="value" style="color:#d97706">${this.formatMoney(saldo)}</span>
          </div>` : ''}
          <div class="recibo-row">
            <span class="label">Estado</span>
            <span class="value">${estadoLabel}</span>
          </div>
          <div class="recibo-total">
            <span>Total recibido</span>
            <span>${this.formatMoney(monto)}</span>
          </div>
        </div>
        <div class="recibo-footer">
          Registrado por: ${inscrito.registradoPor || '—'} &nbsp;|&nbsp;
          Documento generado el ${new Date().toLocaleDateString('es-PE')}
        </div>
      </div>`;
  },

  generateResumen(stats, inscritos) {
    const costo = CONFIG.EVENTO.costo;
    const pendienteTotal = inscritos.reduce((sum, i) => {
      const m = parseFloat(i.monto) || 0;
      return sum + Math.max(0, costo - m);
    }, 0);

    return `
      <div id="resumen-print">
        <p style="text-align:center;color:#64748b;font-size:.85rem;margin-bottom:1rem">
          ${CONFIG.EVENTO.institucion}<br>
          <strong>${CONFIG.EVENTO.nombre}</strong>
        </p>
        <div class="resumen-grid">
          <div class="resumen-item">
            <div class="val">${stats.total}</div>
            <div class="lbl">Total inscritos</div>
          </div>
          <div class="resumen-item">
            <div class="val">${stats.cancelados}</div>
            <div class="lbl">Pagos completos</div>
          </div>
          <div class="resumen-item">
            <div class="val">${stats.adelantados}</div>
            <div class="lbl">Con adelanto</div>
          </div>
          <div class="resumen-item">
            <div class="val">${Receipt.formatMoney(pendienteTotal)}</div>
            <div class="lbl">Saldo pendiente total</div>
          </div>
        </div>
        <div class="resumen-total-box">
          <div class="val">${Receipt.formatMoney(stats.ingresos)}</div>
          <div class="lbl">Ingresos totales recaudados</div>
        </div>
        <p style="text-align:center;font-size:.75rem;color:#94a3b8;margin-top:1rem">
          Generado el ${new Date().toLocaleString('es-PE')}
        </p>
      </div>`;
  }
};
