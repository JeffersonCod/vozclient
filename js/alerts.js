// configuração padrão aplicada em todos os alertas SweetAlert2
const SA = { background: '#0c1628', color: '#f1f5f9', confirmButtonColor: '#1a56db' };

// alerta de campo obrigatório vazio
function alertCampoVazio(titulo, texto, campoId) {
  if (campoId) shake(campoId);
  Swal.fire({ ...SA, icon: 'warning', title: titulo, text: texto });
}

// alerta de sucesso ao enviar avaliação com opção de redirecionar
function alertEnvioSucesso(onVerAvaliacoes) {
  Swal.fire({
    ...SA, icon: 'success', title: 'Avaliação enviada! 🎉',
    html: '<p style="color:#94a3b8">Feedback registrado com sucesso.</p>',
    confirmButtonText: 'Ver avaliações',
    showCancelButton: true, cancelButtonText: 'Nova avaliação', cancelButtonColor: '#0d9488'
  }).then(r => {
    if (r.isConfirmed) onVerAvaliacoes();
  });
}

// alerta de confirmação antes de excluir um card de avaliação
function alertExcluirCard(onConfirm) {
  Swal.fire({
    ...SA, title: 'Excluir avaliação?', text: 'Esta ação não pode ser desfeita.',
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#e11d48', cancelButtonColor: '#1a56db',
    confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar'
  }).then(r => {
    if (r.isConfirmed) {
      onConfirm();
      Swal.fire({ ...SA, icon: 'success', toast: true, position: 'top-end', title: 'Excluído!', showConfirmButton: false, timer: 1800 });
    }
  });
}

// alerta de confirmação antes de excluir da tabela de administração
function alertExcluirAdmin(onConfirm) {
  Swal.fire({
    ...SA, icon: 'warning', title: 'Excluir?',
    showCancelButton: true, confirmButtonColor: '#e11d48',
    cancelButtonColor: '#1a56db', confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar'
  }).then(r => {
    if (r.isConfirmed) onConfirm();
  });
}

// alerta com campo de texto para editar o título de um feedback
function alertEditarTitulo(valorAtual, onSalvar) {
  Swal.fire({
    ...SA, title: 'Editar título', input: 'text', inputValue: valorAtual,
    showCancelButton: true, cancelButtonText: 'Cancelar', confirmButtonText: 'Salvar',
    inputAttributes: { style: 'background:#1a2540;color:#f1f5f9;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px;width:100%;font-family:inherit;' }
  }).then(r => {
    if (r.isConfirmed && r.value) {
      onSalvar(r.value);
      Swal.fire({ ...SA, icon: 'success', toast: true, position: 'top-end', title: 'Salvo!', showConfirmButton: false, timer: 1600 });
    }
  });
}
