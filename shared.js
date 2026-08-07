// ============================================================
// Configuración de Supabase (clave pública, segura de exponer)
// ============================================================
export const SUPABASE_URL = 'https://cewwbutnpkjocjynapem.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_C3nZa7XNVocbPOXOGXMNUA_ZhAQZobf';

export const CATEGORIAS = ['3ra', '4ta', '5ta', '6ta', '7ma', '8va'];

export const CATEGORIA_LABEL = {
  '3ra': '3ª',
  '4ta': '4ª',
  '5ta': '5ª',
  '6ta': '6ª',
  '7ma': '7ª',
  '8va': '8ª'
};
// ============================================================
// Categorías "Suma" (p.ej. Suma 11, Suma 14): la categoría de la
// pareja surge de sumar la categoría individual de cada jugador.
// El admin puede crear las que quiera (Suma 5 a Suma 16, o la que sea)
// desde el panel — no están hardcodeadas, se guardan en state.config.
// ============================================================
export const DEFAULT_CATEGORIAS_SUMA = [11, 14];

export function isCategoriaSuma(codigo){
  return /^suma\d+$/.test(String(codigo||''));
}

export function sumaCategoriaCode(n){
  return `suma${n}`;
}

export function getCategoriasSumaConfig(state){
  const arr = (state?.config?.categoriasSuma) || [];
  return arr.slice().sort((a,b)=>a-b);
}

// Todas las categorías disponibles para armar un torneo: las fijas + las Suma configuradas
export function getAllCategorias(state){
  const extra = getCategoriasSumaConfig(state).map(sumaCategoriaCode);
  return [...CATEGORIAS, ...extra];
}

// Etiqueta de cualquier categoría (fija o Suma dinámica)
export function getCategoriaLabel(state, codigo){
  if(CATEGORIA_LABEL[codigo]) return CATEGORIA_LABEL[codigo];
  const m = /^suma(\d+)$/.exec(codigo||'');
  if(m) return `Suma ${m[1]}`;
  return codigo || '';
}

// ============================================================
// Configuración de puntuación (editable desde el panel de admin;
// estos son los valores por defecto la primera vez)
// ============================================================
export const DEFAULT_PUNTOS_CONFIG = {
  campeon: 100,
  subcampeon: 60,
  semifinal: 30,
  cuartos: 15,
  octavos: 5,
  dieciseisavos: 2,
};

export const POSICION_LABELS = {
  campeon: 'Campeón',
  subcampeon: 'Subcampeón',
  semifinal: 'Semifinalista',
  cuartos: 'Cuartos de final',
  octavos: 'Octavos de final',
  dieciseisavos: '16vos de final',
};

// ============================================================
// Lateralidad
// ============================================================
export const LATERALIDADES = { 'diestro': 'Diestro', 'zurdo': 'Zurdo' };

// ============================================================
// Género (para diferenciar el ranking masculino del femenino)
// ============================================================
export const GENEROS = { 'masculino': 'Masculino', 'femenino': 'Femenino' };

// ============================================================
// Género de TORNEO (a diferencia del género de un jugador, un torneo
// puede ser masculino, femenino o mixto). Esto determina qué jugadores
// se pueden inscribir en él:
//   - masculino/femenino: las dos personas de la pareja tienen que ser
//     de ese género.
//   - mixto: la pareja tiene que tener un jugador y una jugadora.
// ============================================================
export const TORNEO_GENEROS = { 'masculino': 'Masculino', 'femenino': 'Femenino', 'mixto': 'Mixto' };

export function getTorneoGeneroLabel(codigo){
  return TORNEO_GENEROS[codigo] || '';
}

// ============================================================
// Ronda de un partido programado ("próximos partidos"). Es un dato
// que carga el admin a mano al programar el partido, para mostrar
// en la web pública (ej: "Octavos de Final").
// ============================================================
export const RONDA_LABELS = {
  grupos: 'Fase de Grupos',
  dieciseisavos: '16vos de Final',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  final: 'Final',
};
export const RONDA_OPCIONES = Object.keys(RONDA_LABELS);
export function getRondaLabel(codigo){
  return RONDA_LABELS[codigo] || '';
}

// ============================================================
// Utilidades
// ============================================================
export function uid(prefix='id'){
  return prefix + '_' + Math.random().toString(36).slice(2,10);
}

// Una pareja sin campo "estado" se considera aprobada (compatibilidad con datos viejos)
export function isAprobada(p){
  return (p.estado || 'aprobada') === 'aprobada';
}

// Une el nombre escrito en una pareja con un registro real de la tabla de
// jugadores: si ya existe alguien con ese nombre lo reutiliza, si no lo crea.
// Así toda pareja (inscripta desde la web o cargada por el admin) queda
// vinculada a jugadores reales que después aparecen en "Jugadores" y suman
// puntos de ranking.
//
// Si se pasa "generoEsperado" (porque el torneo exige un género puntual para
// esta persona), se valida contra el género ya guardado del jugador:
//   - Si el jugador ya existe y su género no coincide -> devuelve error y NO
//     crea/modifica nada, para no mezclar categorías masculinas/femeninas.
//   - Si el jugador ya existe pero no tenía género cargado (dato viejo) -> se
//     completa con el esperado.
//   - Si el jugador es nuevo -> se crea con ese género.
// Devuelve { id, error }. Si error no es null, "id" es null y no hay que usarlo.
export function resolverJugadorId(state, nombre, categoria, generoEsperado){
  const nombreNorm = (nombre || '').trim();
  if(!nombreNorm) return { id: null, error: null };
  state.jugadores = state.jugadores || [];
  let jugador = state.jugadores.find(j => (j.nombre||'').trim().toLowerCase() === nombreNorm.toLowerCase());
  if(!jugador){
    jugador = { id: uid('j'), nombre: nombreNorm, lateralidad:'diestro', genero: generoEsperado || '', categoria, foto:'', historial:[] };
    state.jugadores.push(jugador);
    return { id: jugador.id, error: null };
  }
  if(generoEsperado){
    if(jugador.genero && jugador.genero !== generoEsperado){
      return {
        id: null,
        error: `${jugador.nombre} ya está registrado como ${GENEROS[jugador.genero] || jugador.genero}, no puede anotarse como ${GENEROS[generoEsperado] || generoEsperado}.`
      };
    }
    if(!jugador.genero) jugador.genero = generoEsperado;
  }
  return { id: jugador.id, error: null };
}

// Dado el género configurado en el torneo, calcula qué género le corresponde
// a cada integrante de la pareja:
//   - "masculino"/"femenino": los dos tienen que ser de ese género (no hace
//     falta elegir nada en el formulario).
//   - "mixto": hay que elegir el género de cada uno (generoSelJ1/J2) y tienen
//     que ser distintos entre sí (un jugador y una jugadora).
//   - sin configurar (torneos viejos): no se exige nada.
// Devuelve { generoJ1, generoJ2, error }.
export function resolverGenerosPareja(torneoGenero, generoSelJ1, generoSelJ2){
  if(torneoGenero === 'masculino') return { generoJ1: 'masculino', generoJ2: 'masculino', error: null };
  if(torneoGenero === 'femenino') return { generoJ1: 'femenino', generoJ2: 'femenino', error: null };
  if(torneoGenero === 'mixto'){
    if(!generoSelJ1 || !generoSelJ2) return { generoJ1: null, generoJ2: null, error: 'Elegí el género de cada jugador.' };
    if(generoSelJ1 === generoSelJ2) return { generoJ1: null, generoJ2: null, error: 'En un torneo Mixto la pareja tiene que tener un jugador y una jugadora.' };
    return { generoJ1: generoSelJ1, generoJ2: generoSelJ2, error: null };
  }
  return { generoJ1: null, generoJ2: null, error: null };
}

// ============================================================
// Cuentas de jugadores (Supabase Auth + tabla "profiles")
// ============================================================
// Cada jugador se crea su propia cuenta (email + contraseña) con sus datos:
// nombre, teléfono, categoría, mano hábil y género. Esta info NO vive en el
// documento JSON de "torneos" sino en la tabla "profiles" de Supabase, ligada
// 1 a 1 con auth.users. Ver setup.sql para la creación de esta tabla, sus
// políticas de RLS, y la función buscar_jugadores usada para elegir compañero.

export async function crearCuentaJugador(supabase, { email, password, nombre, telefono, categoria, lateralidad, genero }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { nombre, telefono, categoria, lateralidad, genero } }
  });
  if (error) throw error;
  return data;
}

export async function iniciarSesionJugador(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function cerrarSesionJugador(supabase) {
  await supabase.auth.signOut();
}

export async function obtenerMiPerfil(supabase, userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Trae el perfil de la cuenta logueada. Si por algún motivo la fila en
// "profiles" no se creó sola al registrarse (por ejemplo, si la cuenta se
// creó antes de correr setup.sql, o el trigger no llegó a dispararse), la
// arma acá mismo con los datos que quedaron guardados en la cuenta de
// Supabase Auth (user_metadata), en vez de dejar a la persona sin perfil
// para siempre.
export async function asegurarMiPerfil(supabase, user) {
  let perfil = await obtenerMiPerfil(supabase, user.id);
  if (perfil) return perfil;

  const meta = user.user_metadata || {};
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    nombre: meta.nombre || user.email || '',
    telefono: meta.telefono || '',
    categoria: meta.categoria || '',
    lateralidad: meta.lateralidad || 'diestro',
    genero: meta.genero || '',
  });
  if (error) throw error;
  return await obtenerMiPerfil(supabase, user.id);
}

// Busca jugadores YA REGISTRADOS (con cuenta) por nombre, para elegir compañero
// de pareja al inscribirse. Usa la función RPC "buscar_jugadores" (ver setup.sql),
// que sólo expone nombre/categoría/género/lateralidad (no email ni teléfono de
// terceros).
export async function buscarJugadoresRegistrados(supabase, texto) {
  const limpio = (texto || '').trim();
  if (limpio.length < 2) return [];
  const { data, error } = await supabase.rpc('buscar_jugadores', { busqueda: limpio });
  if (error) throw error;
  return data || [];
}

// Vincula (o crea) la entrada correspondiente en state.jugadores para un
// perfil de cuenta ya registrado, marcándola con authId para que quede
// asociada de forma estable a esa cuenta (y no sólo por nombre). El perfil
// de la cuenta es la fuente de verdad: si ya existía un jugador con ese
// nombre (cargado antes a mano por el admin), se actualiza con los datos
// del perfil y se le pega el authId.
export function resolverJugadorDesdePerfil(state, perfil) {
  state.jugadores = state.jugadores || [];
  let jugador = state.jugadores.find(j => j.authId === perfil.id);
  if (!jugador) {
    jugador = state.jugadores.find(j => (j.nombre || '').trim().toLowerCase() === (perfil.nombre || '').trim().toLowerCase() && !j.authId);
  }
  if (jugador) {
    jugador.authId = perfil.id;
    jugador.nombre = perfil.nombre;
    jugador.lateralidad = perfil.lateralidad || jugador.lateralidad;
    jugador.genero = perfil.genero || jugador.genero;
    jugador.categoria = perfil.categoria || jugador.categoria;
    return { id: jugador.id };
  }
  jugador = {
    id: uid('j'), authId: perfil.id, nombre: perfil.nombre,
    lateralidad: perfil.lateralidad || 'diestro', genero: perfil.genero || '',
    categoria: perfil.categoria || '', foto: '', historial: []
  };
  state.jugadores.push(jugador);
  return { id: jugador.id };
}

// Busca (sin crear nada) el jugador de state.jugadores vinculado a un perfil
// de cuenta, para saber si esa cuenta ya está anotada en algún torneo. Usa el
// authId si ya quedó vinculado (por haberse inscripto alguna vez desde la
// web); si no, intenta por nombre como respaldo (por si el admin lo cargó a
// mano en un torneo antes de que esa persona se creara la cuenta).
export function encontrarJugadorIdPorPerfil(state, perfil){
  if(!perfil) return null;
  const jugadores = state.jugadores || [];
  const porAuth = jugadores.find(j => j.authId === perfil.id);
  if(porAuth) return porAuth.id;
  const porNombre = jugadores.find(j => (j.nombre||'').trim().toLowerCase() === (perfil.nombre||'').trim().toLowerCase());
  return porNombre ? porNombre.id : null;
}

// ============================================================
// Selector con menú desplegable propio (reemplazo visual de <select>)
// ============================================================
// En mobile, un <select> nativo abre el picker del sistema operativo (la
// rueda de Android/iOS), que no se puede ni animar ni estilizar. Esta
// función arma, al lado de un <select> ya existente, un menú propio animado
// que muestra las mismas opciones — el <select> original se oculta pero
// sigue existiendo en el DOM: ahí sigue viviendo el valor real, y el resto
// del código sigue funcionando exactamente igual (leyendo selectEl.value,
// escuchando selectEl.addEventListener('change', ...), etc.).
//
// Se llama de nuevo cada vez que cambian las <option> del select (por
// ejemplo, después de reconstruir su innerHTML), para que el menú visual se
// mantenga sincronizado.
let _customSelectListenerGlobal = false;

function _cerrarSelectorCustom(wrap){
  wrap.classList.remove('open');
  const btn = wrap.querySelector('.custom-select-btn');
  if(btn) btn.setAttribute('aria-expanded', 'false');
}
function _abrirSelectorCustom(wrap){
  document.querySelectorAll('.custom-select.open').forEach(w => { if(w !== wrap) _cerrarSelectorCustom(w); });
  wrap.classList.add('open');
  const btn = wrap.querySelector('.custom-select-btn');
  if(btn) btn.setAttribute('aria-expanded', 'true');
}

export function actualizarSelectorCustom(selectEl){
  if(!selectEl) return;
  selectEl.style.display = 'none';
  selectEl.setAttribute('aria-hidden', 'true');
  selectEl.tabIndex = -1;

  let wrap = selectEl.nextElementSibling;
  if(!wrap || !wrap.classList || !wrap.classList.contains('custom-select-generated')){
    wrap = document.createElement('div');
    wrap.className = 'custom-select custom-select-generated';
    wrap.innerHTML = `
      <button type="button" class="custom-select-btn" aria-haspopup="listbox" aria-expanded="false">
        <span class="custom-select-label">Elegí una opción</span>
        <svg class="custom-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="custom-select-panel" role="listbox"></div>
    `;
    selectEl.insertAdjacentElement('afterend', wrap);

    wrap.querySelector('.custom-select-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      wrap.classList.contains('open') ? _cerrarSelectorCustom(wrap) : _abrirSelectorCustom(wrap);
    });

    if(!_customSelectListenerGlobal){
      document.addEventListener('click', (e)=>{
        document.querySelectorAll('.custom-select.open').forEach(w=>{
          if(!w.contains(e.target)) _cerrarSelectorCustom(w);
        });
      });
      _customSelectListenerGlobal = true;
    }
  }

  const panel = wrap.querySelector('.custom-select-panel');
  const label = wrap.querySelector('.custom-select-label');
  const opciones = Array.from(selectEl.options);

  panel.innerHTML = opciones.map(o =>
    `<div class="custom-select-option${o.value === selectEl.value ? ' active' : ''}" data-value="${o.value}" role="option">${o.textContent}</div>`
  ).join('');
  const actual = opciones.find(o => o.value === selectEl.value);
  label.textContent = actual ? actual.textContent : 'Elegí una opción';

  panel.querySelectorAll('.custom-select-option').forEach(opt=>{
    opt.onclick = ()=>{
      label.textContent = opt.textContent;
      panel.querySelectorAll('.custom-select-option').forEach(o => o.classList.toggle('active', o === opt));
      if(opt.dataset.value !== selectEl.value){
        selectEl.value = opt.dataset.value;
        selectEl.dispatchEvent(new Event('change'));
      }
      _cerrarSelectorCustom(wrap);
    };
  });
}

// ============================================================
// Revelado al scrollear ("la página se va construyendo")
// ============================================================
// Cualquier elemento con clase "reveal" arranca invisible/corrido, y cuando
// entra en pantalla se le agrega "reveal-visible" (clase que dispara la
// transición suave, definida en el CSS de cada página) — sin escuchar el
// evento scroll a mano, con IntersectionObserver. Una vez revelado, se deja
// de observar (no vuelve a ocultarse si subís de nuevo).
let _revealObserver = null;
function _getRevealObserver(){
  if(!_revealObserver){
    _revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('reveal-visible');
          _revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  }
  return _revealObserver;
}
export function activarReveal(contenedor){
  const observer = _getRevealObserver();
  (contenedor || document).querySelectorAll('.reveal:not(.reveal-visible)').forEach(el => observer.observe(el));
}

// Cupo máximo de parejas para todo el torneo (no por categoría, según se
// definió). Cuenta sólo las parejas ya APROBADAS, sumando entre todas las
// categorías del torneo — las pendientes de revisión todavía no ocupan lugar.
export function contarParejasAprobadas(t){
  return Object.values(t.parejas || {}).reduce((acc, lista) => acc + (lista || []).filter(isAprobada).length, 0);
}

export function getCupoInfo(t){
  const cupo = t.cupo;
  if(!cupo || cupo <= 0) return null;
  const ocupadas = contarParejasAprobadas(t);
  const disponibles = Math.max(0, cupo - ocupadas);
  return { cupo, ocupadas, disponibles, lleno: ocupadas >= cupo };
}

// ============================================================
// Datos de ejemplo (se cargan una sola vez, si la base está vacía)
// ============================================================
export function seedDemoData(){
  // Jugadores individuales
  const jugadores = [
    {id:uid('j'), nombre:'Fabricio Gonzalez', lateralidad:'diestro', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Juan Martinez', lateralidad:'zurdo', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Martín López', lateralidad:'diestro', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Lucas Fernández', lateralidad:'diestro', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Nico Ruiz', lateralidad:'zurdo', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Fede García', lateralidad:'diestro', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Tomi Sánchez', lateralidad:'diestro', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
    {id:uid('j'), nombre:'Santi Pérez', lateralidad:'zurdo', genero:'masculino', categoria:'7ma', foto:'', historial:[]},
  ];

  const parejas7ma = [
    {id:uid('p'), j1_id:jugadores[0].id, j2_id:jugadores[1].id, j1:jugadores[0].nombre, j2:jugadores[1].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[2].id, j2_id:jugadores[3].id, j1:jugadores[2].nombre, j2:jugadores[3].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[4].id, j2_id:jugadores[5].id, j1:jugadores[4].nombre, j2:jugadores[5].nombre, telefono:'', estado:'aprobada'},
    {id:uid('p'), j1_id:jugadores[6].id, j2_id:jugadores[7].id, j1:jugadores[6].nombre, j2:jugadores[7].nombre, telefono:'', estado:'aprobada'},
  ];

  const torneo = {
    id: uid('t'),
    nombre: 'Apertura Marzo',
    fecha: '14 al 22 de Marzo',
    lugar: 'Padel Club Norte',
    estado: 'curso',
    inscripcionAbierta: false,
    genero: 'masculino',
    categorias: ['7ma','6ta','5ta'],
    parejas: { '7ma': parejas7ma, '6ta': [], '5ta': [] },
    brackets: { '7ma': null, '6ta': null, '5ta': null },
    partidos: [
      {
        id: uid('partido'), categoria: '7ma',
        equipoA: `${parejas7ma[0].j1} / ${parejas7ma[0].j2}`,
        equipoB: `${parejas7ma[1].j1} / ${parejas7ma[1].j2}`,
        fecha: '2026-05-18', hora: '16:00', cancha: 'Cancha 2', jugado: false
      },
      {
        id: uid('partido'), categoria: '7ma',
        equipoA: `${parejas7ma[2].j1} / ${parejas7ma[2].j2}`,
        equipoB: `${parejas7ma[3].j1} / ${parejas7ma[3].j2}`,
        fecha: '2026-05-18', hora: '18:30', cancha: 'Cancha 1', jugado: false
      }
    ]
  };
  torneo.brackets['7ma'] = generateBracket(torneo.parejas['7ma']);

  const otros = [
    { nombre:'Copa Otoño', fecha:'04 de Abril', lugar:'Reja Sur Pádel', categorias:['4ta','6ta'] },
    { nombre:'Torneo Amistad', fecha:'25 de Abril', lugar:'Club Atlético Oeste', categorias:['5ta','7ma'] },
    { nombre:'Nocturno de Mayo', fecha:'16 de Mayo', lugar:'Padel Indoor Centro', categorias:['3ra','5ta'] },
  ].map(t=>({
    id: uid('t'), nombre:t.nombre, fecha:t.fecha, lugar:t.lugar, estado:'abierto',
    inscripcionAbierta: true,
    genero: 'masculino',
    categorias:t.categorias,
    parejas: Object.fromEntries(t.categorias.map(c=>[c,[]])),
    brackets: Object.fromEntries(t.categorias.map(c=>[c,null])),
    partidos: [],
  }));

  return { torneos: [torneo, ...otros], jugadores, config: { puntos: {...DEFAULT_PUNTOS_CONFIG}, categoriasSuma: [...DEFAULT_CATEGORIAS_SUMA] } };
}

// ============================================================
// Generación de llaves (bracket de eliminación directa)
// ============================================================
function nextPow2(n){ let p=1; while(p<n) p*=2; return p; }

function seedOrder(size){
  let seeds=[1];
  while(seeds.length<size){
    const l = seeds.length*2;
    const next=[];
    seeds.forEach(s=>{ next.push(s); next.push(l+1-s); });
    seeds = next;
  }
  return seeds;
}

export function generateBracket(parejas){
  // Filtrar solo parejas aprobadas
  const aprobadas = parejas.filter(isAprobada);
  const n = aprobadas.length;
  if(n < 2) return null;
  const size = nextPow2(n);
  const order = seedOrder(size);
  const slots = order.map(seed => seed<=n ? {...aprobadas[seed-1], seed} : {bye:true, seed});

  const round0 = [];
  for(let i=0;i<slots.length;i+=2){
    const teamA = slots[i], teamB = slots[i+1];
    let winner = null;
    if(teamA.bye && !teamB.bye) winner = teamB;
    else if(teamB.bye && !teamA.bye) winner = teamA;
    round0.push({ teamA, teamB, winner });
  }

  const rounds = [round0];
  let current = round0;
  while(current.length > 1){
    const next = [];
    for(let i=0;i<current.length;i+=2){
      next.push({ teamA: current[i].winner || null, teamB: current[i+1].winner || null, winner:null });
    }
    rounds.push(next);
    current = next;
  }
  return rounds;
}

export function propagateWinner(rounds, roundIdx, matchIdx, winner){
  rounds[roundIdx][matchIdx].winner = winner;
  if(roundIdx+1 < rounds.length){
    const nextMatchIdx = Math.floor(matchIdx/2);
    const slot = matchIdx % 2 === 0 ? 'teamA' : 'teamB';
    rounds[roundIdx+1][nextMatchIdx][slot] = winner;
    // si al asignar se completa un cruce donde el otro lado ya tenía bye, no aplica (los byes solo viven en ronda 0)
  }
}

// ============================================================
// Funciones para ranking y puntuación
// ============================================================
export function calcularRankingPorCategoria(jugadores, categoria, genero){
  // Mostramos a cualquier jugador que haya sumado puntos en esta categoría según su
  // historial, sin depender de su categoría individual fija. Esto es clave porque en
  // una pareja los dos integrantes pueden tener categorías propias distintas (uno de
  // 6ta jugando con uno de 7ma, por ejemplo): antes, al filtrar por j.categoria, el
  // jugador cuya categoría propia no coincidía con la del torneo quedaba afuera del
  // ranking aunque sí hubiera sumado los puntos.
  let jugadoresCat = jugadores.filter(j => (j.historial||[]).some(h=>h.categoria===categoria));
  if(genero){
    jugadoresCat = jugadoresCat.filter(j=>j.genero===genero);
  }
  const ranking = jugadoresCat.map(j=>{
    const puntos = (j.historial || [])
      .filter(h=>h.categoria===categoria)
      .reduce((sum,h)=>sum+(h.puntos_ganados||0), 0);
    return {...j, puntos};
  }).sort((a,b)=>b.puntos - a.puntos);
  return ranking.map((j,i)=>({...j, puesto: i+1}));
}

export function getPuntosConfig(state){
  return { ...DEFAULT_PUNTOS_CONFIG, ...(state.config && state.config.puntos ? state.config.puntos : {}) };
}

// Recorre el historial PERMANENTE de partidos del jugador (independiente de
// que el torneo siga existiendo o se haya borrado — ver registrarPartidoJugado).
export function getJugadorPartidosStats(state, jugadorId){
  const jugador = (state.jugadores || []).find(j=>j.id===jugadorId);
  const historial = jugador?.historialPartidos || [];
  const ganados = historial.filter(h=>h.resultado==='ganado').length;
  const perdidos = historial.filter(h=>h.resultado==='perdido').length;
  return { ganados, perdidos };
}

// Guarda, para cada integrante de la pareja ganadora y la perdedora, un
// registro PERMANENTE del resultado de ese partido (con el nombre del rival
// y del torneo ya "congelados" en el registro). A diferencia de antes, esto
// no depende de que el torneo siga existiendo: si más adelante se borra el
// torneo, el jugador no pierde su cuenta de partidos ganados/perdidos.
// "matchKey" identifica unívocamente el cruce (torneo+categoría+ronda+índice)
// para no duplicar el registro si se llama más de una vez sobre el mismo
// partido (por ejemplo, al migrar datos cargados con una versión anterior).
function registrarPartidoJugado(state, matchKey, torneoId, torneoNombre, categoria, teamGanador, teamPerdedor){
  const registrar = (team, rivalTeam, resultado) => {
    if(!team || team.bye) return;
    [team.j1_id, team.j2_id].forEach(jId=>{
      if(!jId) return;
      const jugador = state.jugadores.find(j=>j.id===jId);
      if(!jugador) return;
      jugador.historialPartidos = jugador.historialPartidos || [];
      if(jugador.historialPartidos.some(h=>h.matchKey===matchKey)) return; // ya registrado
      const rival = (rivalTeam && !rivalTeam.bye) ? `${rivalTeam.j1} / ${rivalTeam.j2}` : null;
      jugador.historialPartidos.push({
        matchKey, torneoId, torneoNombre, categoria, resultado, rival, fecha: new Date().toISOString()
      });
    });
  };
  registrar(teamGanador, teamPerdedor, 'ganado');
  registrar(teamPerdedor, teamGanador, 'perdido');
}

// Recorre todos los torneos y "rellena" el historial permanente de partidos
// de cada jugador con los cruces que ya estaban definidos pero que se
// jugaron antes de que existiera este historial (o que por algún motivo no
// quedaron registrados). Es seguro llamarla repetidas veces: registrarPartidoJugado
// no duplica un mismo partido gracias a matchKey.
function backfillHistorialPartidos(state){
  (state.torneos || []).forEach(t=>{
    Object.entries(t.brackets || {}).forEach(([categoria, rounds])=>{
      if(!rounds) return;
      rounds.forEach((round, ri)=>{
        round.forEach((match, mi)=>{
          const { teamA, teamB, winner } = match;
          if(!teamA || !teamB || teamA.bye || teamB.bye || !winner) return;
          const loser = winner.id === teamA.id ? teamB : teamA;
          const matchKey = `${t.id}::${categoria}::${ri}::${mi}`;
          registrarPartidoJugado(state, matchKey, t.id, t.nombre, categoria, winner, loser);
        });
      });
    });
  });
}

function awardPoints(state, torneoId, torneoNombre, categoria, parejaId, puntos, posicion){
  if(!puntos) return;
  const torneo = state.torneos.find(t=>t.id===torneoId);
  if(!torneo) return;
  const pareja = (torneo.parejas[categoria]||[]).find(p=>p.id===parejaId);
  if(!pareja || pareja.bye) return;

  [pareja.j1_id, pareja.j2_id].forEach(jId=>{
    if(!jId) return;
    const jugador = state.jugadores.find(j=>j.id===jId);
    if(jugador){
      // Guardamos el nombre del compañero y del torneo directamente en el historial
      // (y no solo los ids) para que quede fijo aunque más adelante se borre o
      // edite esa pareja, o incluso se borre el torneo entero.
      const companero = (pareja.j1_id === jId) ? pareja.j2 : pareja.j1;
      const companeroId = (pareja.j1_id === jId) ? pareja.j2_id : pareja.j1_id;
      jugador.historial = jugador.historial || [];
      jugador.historial.push({
        torneoId, torneoNombre, categoria, parejaId, puntos_ganados: puntos, posicion, fecha: new Date().toISOString(),
        companero: companero || null, companeroId: companeroId || null
      });
    }
  });
}

// Se llama cada vez que se define el ganador de un cruce en la llave.
// El PERDEDOR de ese cruce queda eliminado ahí, así que recibe los puntos
// de esa posición (semifinalista, cuartos, etc.) según la configuración.
// Si el cruce era la final, además el GANADOR recibe los puntos de campeón.
// También deja un registro permanente de "partido ganado/perdido" para
// ambas parejas, que sobrevive aunque el torneo se borre más adelante.
export function registrarResultadoPartido(state, torneoId, torneoNombre, categoria, rounds, roundIdx, matchIdx, winner, loser){
  const puntos = getPuntosConfig(state);
  const totalRounds = rounds.length;
  const esFinal = roundIdx === totalRounds - 1;
  const fromEnd = totalRounds - roundIdx;
  const posicionMap = {1:'subcampeon', 2:'semifinal', 3:'cuartos', 4:'octavos', 5:'dieciseisavos'};

  if(loser && !loser.bye){
    const posicion = esFinal ? 'subcampeon' : posicionMap[fromEnd];
    if(posicion) awardPoints(state, torneoId, torneoNombre, categoria, loser.id, puntos[posicion], posicion);
  }
  if(esFinal && winner && !winner.bye){
    awardPoints(state, torneoId, torneoNombre, categoria, winner.id, puntos.campeon, 'campeon');
  }

  const matchKey = `${torneoId}::${categoria}::${roundIdx}::${matchIdx}`;
  registrarPartidoJugado(state, matchKey, torneoId, torneoNombre, categoria, winner, loser);
}

export function roundLabel(idx, total){
  const fromEnd = total - idx;
  const map = {1:'FINAL', 2:'SEMIFINALES', 3:'CUARTOS', 4:'OCTAVOS', 5:'16VOS'};
  return map[fromEnd] || `RONDA ${idx+1}`;
}

// ============================================================
// Capa de datos (Supabase) — un único documento JSON en la tabla "torneos"
// ============================================================
export async function loadState(supabase){
  const { data, error } = await supabase.from('torneos').select('data').eq('id','main').maybeSingle();
  if(error) throw error;
  if(data && data.data){
    const state = data.data;
    if(!state.jugadores) state.jugadores = [];
    if(!state.config) state.config = { puntos: {...DEFAULT_PUNTOS_CONFIG} };
    if(!state.config.puntos) state.config.puntos = {...DEFAULT_PUNTOS_CONFIG};
    if(!state.config.categoriasSuma) state.config.categoriasSuma = [...DEFAULT_CATEGORIAS_SUMA];
    // Compatibilidad con torneos guardados antes de que existiera "partidos" / "inscripcionAbierta"
    (state.torneos || []).forEach(t=>{
      if(!t.partidos) t.partidos = [];
      if(t.inscripcionAbierta === undefined) t.inscripcionAbierta = true;
      if(t.genero === undefined) t.genero = null; // torneos viejos: sin restricción de género hasta que el admin lo configure
    });
    // Completa el historial permanente de partidos ganados/perdidos con los cruces
    // que ya estaban jugados antes de que existiera este registro (o algún torneo
    // que se haya guardado sin pasar por registrarResultadoPartido). Así, cuando
    // se borre un torneo, esos partidos ya quedaron a salvo en cada jugador.
    backfillHistorialPartidos(state);
    return state;
  }
  const seeded = seedDemoData();
  await saveState(supabase, seeded);
  return seeded;
}

export async function saveState(supabase, state){
  const { error } = await supabase.from('torneos').upsert({
    id: 'main', data: state, updated_at: new Date().toISOString()
  });
  if(error) throw error;
}

// ============================================================
// Instalar app (PWA)
// ============================================================
// Botón "Instalar app" en la navbar. En Android/Chrome/Edge escuchamos el
// evento "beforeinstallprompt" que dispara el navegador cuando detecta que
// el sitio cumple los requisitos (manifest.json + service worker + HTTPS):
// lo guardamos y recién mostramos el botón ahí, para no mostrar un botón
// que todavía no puede hacer nada. Al tocarlo, disparamos el diálogo nativo
// de instalación con ese evento guardado.
//
// En iPhone (Safari) ese evento no existe — Apple no lo expone — así que ahí
// no hay forma de disparar la instalación por código. Lo único que se puede
// hacer es mostrarle a la persona las instrucciones manuales ("Compartir" →
// "Agregar a pantalla de inicio"), por eso en iOS mostramos el botón directo
// y, al tocarlo, abrimos un modal con esos pasos en vez de un prompt nativo.
//
// Si la página ya se está ejecutando como app instalada (display-mode:
// standalone, o navigator.standalone en iOS), ocultamos el botón directamente.
let _pwaDeferredPrompt = null;

function _pwaEsStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function _pwaEsIOS(){
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export function setupPwaInstall(){
  const btn = document.getElementById('btn-instalar-app');
  if(!btn) return;

  if(_pwaEsStandalone()){
    btn.style.display = 'none';
    return;
  }

  // El service worker es requisito técnico para que el navegador considere
  // el sitio instalable — no cachea nada por ahora, solo habilita la PWA.
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  if(_pwaEsIOS()){
    btn.style.display = 'flex';
    btn.onclick = ()=>{
      const modal = document.getElementById('pwa-ios-modal');
      if(modal) modal.classList.add('open');
    };
    const modal = document.getElementById('pwa-ios-modal');
    const closeBtn = document.getElementById('pwa-ios-close');
    if(closeBtn) closeBtn.onclick = ()=> modal.classList.remove('open');
    if(modal){
      modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('open'); });
    }
    return;
  }

  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    _pwaDeferredPrompt = e;
    btn.style.display = 'flex';
  });

  btn.onclick = async ()=>{
    if(!_pwaDeferredPrompt) return;
    _pwaDeferredPrompt.prompt();
    await _pwaDeferredPrompt.userChoice;
    _pwaDeferredPrompt = null;
    btn.style.display = 'none';
  };

  window.addEventListener('appinstalled', ()=>{
    btn.style.display = 'none';
    _pwaDeferredPrompt = null;
  });
}
