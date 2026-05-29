// dados dos feedbacks armazenados em array
let feedbacks = [
  { id:1, name:'Carlos Mendes', email:'', cat:'Atendimento ao Cliente', rating:5, mood:'Ótimo', title:'Excelente atendimento!', comment:'Fui atendido com rapidez e atenção. Resolveram minha dúvida em minutos!', rec:'sim', date:'10/05/2025' },
  { id:2, name:'Ana Beatriz', email:'', cat:'Produto / Serviço', rating:4, mood:'Bom', title:'Produto de ótima qualidade', comment:'Superou minhas expectativas. Só o prazo de entrega foi um pouco longo.', rec:'sim', date:'11/05/2025' },
  { id:3, name:'Ricardo Lima', email:'', cat:'Entrega / Logística', rating:3, mood:'Ok', title:'Entrega dentro do prazo', comment:'Chegou no prazo, mas a embalagem estava danificada.', rec:'talvez', date:'12/05/2025' },
  { id:4, name:'Fernanda Costa', email:'', cat:'Suporte Técnico', rating:5, mood:'Ótimo', title:'Suporte incrível!', comment:'Resolveram meu problema em minutos. Equipe muito capacitada!', rec:'sim', date:'13/05/2025' },
  { id:5, name:'Jorge Alves', email:'', cat:'Preço / Custo-benefício', rating:2, mood:'Ruim', title:'Preço acima do mercado', comment:'O produto é bom mas o preço está acima dos concorrentes.', rec:'nao', date:'14/05/2025' },
  { id:6, name:'Patrícia Rocha', email:'', cat:'Plataforma / App', rating:4, mood:'Bom', title:'App fácil de usar', comment:'Plataforma muito intuitiva. Fiz tudo sem precisar de tutorial.', rec:'sim', date:'15/05/2025' },
];

// estado do formulário
let formRating = 0;
let formMood = '';
let activeFilter = 'all';

// mapa de emoji por humor
const moodEmoji = { 'Péssimo':'😡', 'Ruim':'😕', 'Ok':'😐', 'Bom':'😊', 'Ótimo':'🤩' };

// ── NAVEGAÇÃO ──

function goTo(viewId, btnEl) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  if (btnEl) btnEl.classList.add('active');
  window.scrollTo(0, 0);

  // renderiza o conteúdo dinâmico da view ao entrar nela
  if (viewId === 'list')      renderList(activeFilter);
  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'admin')     renderAdmin();
  if (viewId === 'search')    runSearch();
  updateStats();
}

// ── ESTRELAS ──

// inicializa os eventos de hover e clique nas estrelas
(function initStars() {
  const container = document.getElementById('form-stars');
  container.querySelectorAll('.star').forEach(s => {
    s.addEventListener('mouseenter', () => highlightStars(+s.dataset.v));
    s.addEventListener('mouseleave', () => highlightStars(formRating));
    s.addEventListener('click', () => {
      formRating = +s.dataset.v;
      highlightStars(formRating);
    });
  });
})();

function highlightStars(val) {
  document.getElementById('form-stars').querySelectorAll('.star')
    .forEach(s => s.classList.toggle('on', +s.dataset.v <= val));
}

// ── BOTÕES DE HUMOR ──

document.getElementById('form-mood').querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#form-mood .mood-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    formMood = btn.dataset.m;
  });
});

// ── FORMULÁRIO ──

function submitForm() {
  const name  = document.getElementById('f-name').value.trim();
  const cat   = document.getElementById('f-cat').value;
  const title = document.getElementById('f-title').value.trim();

  // validações com SweetAlert2
  if (!name)       { alertCampoVazio('Nome obrigatório', 'Informe o nome do cliente.', 'f-name'); return; }
  if (!cat)        { alertCampoVazio('Categoria obrigatória', 'Selecione uma categoria.', 'f-cat'); return; }
  if (!formRating) { alertCampoVazio('Nota obrigatória', 'Clique nas estrelas para avaliar.', null); return; }
  if (!title)      { alertCampoVazio('Título obrigatório', 'Adicione um título ao feedback.', 'f-title'); return; }

  // adiciona o novo feedback no início do array
  feedbacks.unshift({
    id: Date.now(),
    name, email: document.getElementById('f-email').value.trim(),
    cat, rating: formRating, mood: formMood || 'Ok', title,
    comment: document.getElementById('f-comment').value.trim(),
    rec: document.getElementById('f-rec').value,
    date: todayDate()
  });

  clearForm();
  updateStats();

  alertEnvioSucesso(() => goTo('list', document.querySelectorAll('.nav-item')[2]));
}

function clearForm() {
  ['f-name','f-email','f-title','f-comment'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-cat').value = '';
  document.getElementById('f-rec').value = '';
  formRating = 0;
  highlightStars(0);
  formMood = '';
  document.querySelectorAll('#form-mood .mood-btn').forEach(b => b.classList.remove('sel'));
}

// ── LISTA DE AVALIAÇÕES ──

function setFilter(val, el) {
  activeFilter = val;
  document.querySelectorAll('.filt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  renderList(val);
}

function renderList(filter) {
  const list = filter === 'all' ? feedbacks : feedbacks.filter(f => f.rating === +filter);
  const grid = document.getElementById('list-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">💬</div><p>${feedbacks.length ? 'Nenhuma avaliação nessa nota.' : 'Nenhuma avaliação cadastrada ainda.'}</p></div>`;
    return;
  }
  grid.innerHTML = list.map((f, i) => buildCard(f, i, true)).join('');
}

// exclui um card com confirmação via SweetAlert2
function deleteCard(id) {
  alertExcluirCard(() => {
    feedbacks = feedbacks.filter(f => f.id !== id);
    renderList(activeFilter);
    updateStats();
  });
}

// ── DASHBOARD ──

function renderDashboard() {
  const total = feedbacks.length;
  const avg = total ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '—';
  const sat = total ? Math.round(feedbacks.filter(f => f.rating >= 4).length / total * 100) + '%' : '—';
  const rec = total ? Math.round(feedbacks.filter(f => f.rec === 'sim').length / total * 100) + '%' : '—';

  document.getElementById('d-total').textContent = total;
  document.getElementById('d-avg').textContent = avg;
  document.getElementById('d-sat').textContent = sat;
  document.getElementById('d-rec').textContent = rec;

  // gráfico de barras por nota (5 a 1)
  document.getElementById('chart-stars').innerHTML = [5,4,3,2,1].map(n => {
    const cnt = feedbacks.filter(f => f.rating === n).length;
    const pct = total ? Math.round(cnt / total * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-lbl">${n}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="bar-cnt">${cnt}</div>
    </div>`;
  }).join('');

  // gráfico de barras por categoria
  const cats = [...new Set(feedbacks.map(f => f.cat))];
  const maxCat = Math.max(...cats.map(c => feedbacks.filter(f => f.cat === c).length), 1);
  document.getElementById('chart-cats').innerHTML = cats.map(c => {
    const cnt = feedbacks.filter(f => f.cat === c).length;
    return `<div class="bar-row">
      <div class="bar-lbl-wide">${c}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(cnt/maxCat*100)}%; background:linear-gradient(90deg,var(--gold),var(--rose))"></div></div>
      <div class="bar-cnt">${cnt}</div>
    </div>`;
  }).join('');
}

// ── ADMINISTRAÇÃO ──

function renderAdmin() {
  const tbody = document.getElementById('admin-tbody');
  if (!feedbacks.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px;">Nenhuma avaliação cadastrada.</td></tr>';
    return;
  }
  tbody.innerHTML = feedbacks.map((f, i) => `
    <tr>
      <td style="color:var(--muted)">${i + 1}</td>
      <td><b>${esc(f.name)}</b></td>
      <td style="font-size:.78rem; color:var(--muted);">${esc(f.cat)}</td>
      <td><span class="badge ${f.rating >= 5 ? 'b5' : f.rating === 4 ? 'b4' : f.rating === 3 ? 'b3' : 'blow'}">★ ${f.rating}</span></td>
      <td style="font-size:.83rem;">${esc(f.title)}</td>
      <td style="color:var(--muted); font-size:.78rem; white-space:nowrap;">${f.date}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost" style="padding:5px 10px; font-size:.75rem;" onclick="editTitle(${f.id})">✏ Editar</button>
          <button class="btn" style="padding:5px 10px; font-size:.75rem; background:rgba(225,29,72,.12); color:#fb7185; border:1px solid rgba(225,29,72,.25);" onclick="deleteAdmin(${f.id})">✕</button>
        </div>
      </td>
    </tr>`).join('');
}

// edita o título de um feedback via SweetAlert2 com input
function editTitle(id) {
  const fb = feedbacks.find(f => f.id === id);
  if (!fb) return;
  alertEditarTitulo(fb.title, novoTitulo => {
    fb.title = novoTitulo;
    renderAdmin();
  });
}

function deleteAdmin(id) {
  alertExcluirAdmin(() => {
    feedbacks = feedbacks.filter(f => f.id !== id);
    renderAdmin();
    updateStats();
  });
}

// ── BUSCA ──

function runSearch() {
  const q   = document.getElementById('search-input').value.trim().toLowerCase();
  const cat = document.getElementById('search-cat').value;
  const rat = document.getElementById('search-rating').value;

  // filtra o array com base no texto e nos selects
  let result = feedbacks;
  if (q)   result = result.filter(f => (f.name + f.title + f.comment).toLowerCase().includes(q));
  if (cat) result = result.filter(f => f.cat === cat);
  if (rat) result = result.filter(f => f.rating === +rat);

  document.getElementById('search-info').textContent = (q || cat || rat)
    ? `${result.length} resultado(s) encontrado(s)` : '';

  const grid = document.getElementById('search-grid');
  if (!result.length) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div><p>Nenhum resultado encontrado.</p></div>';
    return;
  }
  grid.innerHTML = result.map((f, i) => buildCard(f, i, false)).join('');
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('search-cat').value = '';
  document.getElementById('search-rating').value = '';
  runSearch();
}

// ── HELPERS ──

// monta o HTML de um card de feedback
function buildCard(f, i, showDelete) {
  return `<div class="fb-card" style="animation-delay:${i * 0.04}s">
    <div class="fb-top">
      <div>
        <div class="fb-name">${esc(f.name)}</div>
        <div class="fb-cat">📂 ${esc(f.cat)}</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <div class="fb-stars-row">${starsHtml(f.rating)}</div>
        ${showDelete ? `<button class="btn-del" onclick="deleteCard(${f.id})">✕</button>` : ''}
      </div>
    </div>
    <div class="fb-mood">${moodEmoji[f.mood] || '😐'} ${esc(f.mood)}</div>
    <div style="font-weight:700; font-size:.88rem;">${esc(f.title)}</div>
    ${f.comment ? `<div class="fb-comment">"${esc(f.comment)}"</div>` : ''}
    <div class="fb-date">${f.date}</div>
  </div>`;
}

// gera o HTML das estrelas coloridas
function starsHtml(r) {
  return '★'.repeat(r).split('').map(() => `<span class="fs" style="color:var(--gold2)">★</span>`).join('')
       + '★'.repeat(5 - r).split('').map(() => `<span class="fs" style="color:rgba(255,255,255,.1)">★</span>`).join('');
}

// escapa caracteres especiais para evitar XSS
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// retorna a data atual formatada
function todayDate() {
  return new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// anima o campo com erro
function shake(id) {
  const el = document.getElementById(id);
  el.style.animation = 'shk .4s ease';
  el.style.borderColor = '#e11d48';
  setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 500);
}

// atualiza todos os contadores de estatísticas na interface
function updateStats() {
  const total = feedbacks.length;
  const avg = total ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '—';
  const sat = total ? Math.round(feedbacks.filter(f => f.rating >= 4).length / total * 100) + '%' : '—';
  const rec = total ? Math.round(feedbacks.filter(f => f.rec === 'sim').length / total * 100) + '%' : '—';
  ['h-total','d-total','sb-total'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=total; });
  ['h-avg','sb-avg'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=avg; });
  ['h-sat','d-sat','sb-sat'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=sat; });
  ['h-rec','d-rec'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=rec; });
}

// inicializa as estatísticas ao carregar a página
updateStats();
