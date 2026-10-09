(function () {
  "use strict";

  const CLAVE = "parsons-tc1037";
  const MAX_SANGRIA = 3;
  const UMBRAL = 6; // px que debe moverse el puntero para empezar a arrastrar

  const $ = (id) => document.getElementById(id);
  const banco = $("banco");
  const programa = $("programa");
  const mensaje = $("mensaje");

  // ---------- Preparación de los problemas ----------

  function partir(linea) {
    const espacios = linea.match(/^ */)[0].length;
    return { texto: linea.trim(), sangria: Math.floor(espacios / 4) };
  }

  function permutaciones(lista) {
    if (lista.length <= 1) return [lista];
    return lista.flatMap((x, i) =>
      permutaciones(lista.filter((_, j) => j !== i)).map((resto) => [x, ...resto])
    );
  }

  // Todas las soluciones aceptadas de un problema, como listas de {texto, sangria}.
  function expandir(codigo) {
    let soluciones = [[]];
    for (const parte of codigo) {
      const opciones =
        typeof parte === "string"
          ? [[partir(parte)]]
          : permutaciones(parte.libre).map((orden) =>
              orden.flatMap((bloque) => [].concat(bloque).map(partir))
            );
      soluciones = soluciones.flatMap((s) => opciones.map((o) => s.concat(o)));
    }
    return soluciones;
  }

  function revolver(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const problemas = PROBLEMAS.map((p) => {
    const soluciones = expandir(p.codigo);
    const lineas = soluciones[0]
      .map((l) => l.texto)
      .concat((p.distractores || []).map((d) => d.trim()));
    // El título identifica el avance guardado, así no se pierde al reordenar la lista.
    return Object.assign({}, p, { id: p.titulo, soluciones, lineas });
  });

  // ---------- Estado ----------

  const estados = {}; // por problema: { banco, programa, marcas, intentos, resuelto }
  let indice = 0;
  let seleccion = null; // índice de línea seleccionada en "Tu programa"
  let resueltos = leerResueltos();

  function leerResueltos() {
    try {
      return new Set(JSON.parse(localStorage.getItem(CLAVE)) || []);
    } catch (e) {
      return new Set();
    }
  }

  function guardarResueltos() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify([...resueltos]));
    } catch (e) {
      /* sin almacenamiento: el avance solo dura esta visita */
    }
  }

  function nuevoEstado(p) {
    const orden = p.lineas.map((_, i) => i);
    let mezcla = revolver(orden);
    for (let k = 0; k < 5 && mezcla.every((v, i) => v === i); k++) mezcla = revolver(orden);
    return { banco: mezcla, programa: [], marcas: null, intentos: 0, resuelto: false };
  }

  function actual() {
    return problemas[indice];
  }

  function estado() {
    const p = actual();
    if (!estados[p.id]) estados[p.id] = nuevoEstado(p);
    return estados[p.id];
  }

  // ---------- Resaltado de sintaxis ----------

  const PALABRAS = /^(def|return|import|from|as|if|elif|else|for|while|in|and|or|not|True|False|None)$/;
  const TOKENS = /(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;

  function escapar(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function resaltar(texto) {
    let salida = "";
    let ultimo = 0;
    let m;
    TOKENS.lastIndex = 0;
    while ((m = TOKENS.exec(texto))) {
      salida += escapar(texto.slice(ultimo, m.index));
      const t = escapar(m[0]);
      if (m[1]) salida += '<span class="t-cad">' + t + "</span>";
      else if (m[2]) salida += '<span class="t-num">' + t + "</span>";
      else if (PALABRAS.test(m[0])) salida += '<span class="t-pal">' + t + "</span>";
      else salida += t;
      ultimo = TOKENS.lastIndex;
    }
    return salida + escapar(texto.slice(ultimo));
  }

  // ---------- Dibujo ----------

  const ETIQUETAS = { ok: "✓", sangria: "sangría", lugar: "lugar" };

  function crearLinea(p, i, sangria, marca) {
    const li = document.createElement("li");
    li.className = "linea";
    li.dataset.i = i;
    li.tabIndex = 0;
    li.style.setProperty("--sangria", sangria);
    li.innerHTML =
      '<span class="asa" aria-hidden="true">⋮⋮</span><code>' +
      resaltar(p.lineas[i]) +
      '</code><span class="etiqueta"></span>';
    if (marca) {
      li.classList.add("m-" + marca);
      li.querySelector(".etiqueta").textContent = ETIQUETAS[marca];
    }
    return li;
  }

  function pintarLista() {
    const nav = $("lista");
    nav.replaceChildren(
      ...problemas.map((p, n) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = n + 1;
        b.title = p.titulo;
        const hecho = resueltos.has(p.id);
        b.setAttribute("aria-label", "Problema " + (n + 1) + ": " + p.titulo + (hecho ? " (resuelto)" : ""));
        if (hecho) b.classList.add("resuelto");
        if (n === indice) b.setAttribute("aria-current", "true");
        b.addEventListener("click", () => irA(n));
        return b;
      })
    );
    $("progreso").textContent = resueltos.size + " de " + problemas.length + " resueltos";
  }

  function pintarEnunciado() {
    const p = actual();
    $("tema").textContent = "Problema " + (indice + 1) + " · " + p.tema;
    $("titulo").textContent = p.titulo;
    $("descripcion").textContent = p.descripcion;
    $("ejecucion").textContent = p.ejecucion;
  }

  function pintarTablero(enfocar) {
    const p = actual();
    const e = estado();
    banco.replaceChildren(...e.banco.map((i) => crearLinea(p, i, 0, null)));
    programa.replaceChildren(
      ...e.programa.map((l, k) => {
        const li = crearLinea(p, l.i, l.sangria, e.marcas && e.marcas[k]);
        if (l.i === seleccion) li.classList.add("seleccionada");
        return li;
      })
    );
    banco.classList.toggle("vacia", e.banco.length === 0);
    programa.classList.toggle("vacia", e.programa.length === 0);

    const sel = e.programa.find((l) => l.i === seleccion);
    $("btn-menos").disabled = !sel || sel.sangria === 0;
    $("btn-mas").disabled = !sel || sel.sangria === MAX_SANGRIA;
    $("btn-quitar").disabled = !sel;

    if (enfocar != null) {
      const li = document.querySelector('.linea[data-i="' + enfocar + '"]');
      if (li) li.focus({ preventScroll: true });
    }
  }

  function mostrarMensaje(clase, parrafos) {
    mensaje.className = "mensaje " + clase;
    mensaje.replaceChildren(
      ...parrafos.map((t) => {
        const el = document.createElement("p");
        if (Array.isArray(t)) {
          const fuerte = document.createElement("strong");
          fuerte.textContent = t[0];
          el.append(fuerte, " " + t[1]);
        } else {
          el.textContent = t;
        }
        return el;
      })
    );
    mensaje.hidden = false;
  }

  function ocultarMensaje() {
    mensaje.hidden = true;
    mensaje.replaceChildren();
  }

  function irA(n) {
    indice = (n + problemas.length) % problemas.length;
    seleccion = null;
    ocultarMensaje();
    pintarLista();
    pintarEnunciado();
    pintarTablero();
    if (estado().resuelto) mensajeResuelto();
  }

  // ---------- Movimientos ----------

  // Cualquier cambio en el tablero borra la revisión anterior.
  function cambio() {
    estado().marcas = null;
    ocultarMensaje();
  }

  function sacar(i) {
    const e = estado();
    e.banco = e.banco.filter((x) => x !== i);
    e.programa = e.programa.filter((l) => l.i !== i);
  }

  function colocar(i, zona, posicion, sangria) {
    const e = estado();
    sacar(i);
    if (zona === "programa") {
      e.programa.splice(posicion, 0, { i, sangria });
      seleccion = i;
    } else {
      e.banco.splice(posicion, 0, i);
      if (seleccion === i) seleccion = null;
    }
    cambio();
  }

  function sangrar(i, delta) {
    const l = estado().programa.find((x) => x.i === i);
    if (!l) return;
    const nueva = Math.max(0, Math.min(MAX_SANGRIA, l.sangria + delta));
    if (nueva === l.sangria) return;
    l.sangria = nueva;
    cambio();
    pintarTablero(i);
  }

  function subirBajar(i, delta) {
    const e = estado();
    const k = e.programa.findIndex((x) => x.i === i);
    const destino = k + delta;
    if (k < 0 || destino < 0 || destino >= e.programa.length) return;
    const [l] = e.programa.splice(k, 1);
    e.programa.splice(destino, 0, l);
    cambio();
    pintarTablero(i);
  }

  function alTocar(li) {
    const i = Number(li.dataset.i);
    const e = estado();
    if (li.parentElement === banco) {
      colocar(i, "programa", e.programa.length, 0);
    } else {
      seleccion = i;
    }
    pintarTablero(i);
  }

  function devolver(i) {
    colocar(i, "banco", estado().banco.length, 0);
    pintarTablero();
  }

  // ---------- Revisión ----------

  // Subsecuencia común más larga; devuelve pares [posición en a, posición en b].
  function comunes(a, b) {
    const n = a.length;
    const m = b.length;
    const t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
      }
    }
    const pares = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) pares.push([i++, j++]);
      else if (t[i + 1][j] >= t[i][j + 1]) i++;
      else j++;
    }
    return pares;
  }

  function revisar() {
    const p = actual();
    const e = estado();
    if (e.programa.length === 0) {
      mostrarMensaje("falta", ["Todavía no has colocado ninguna línea en tu programa."]);
      return;
    }

    const alumno = e.programa.map((l) => ({ texto: p.lineas[l.i], sangria: l.sangria }));
    const textos = alumno.map((l) => l.texto);

    // Se compara contra la solución aceptada que más se parece.
    let mejor = null;
    for (const sol of p.soluciones) {
      const pares = comunes(textos, sol.map((l) => l.texto));
      const conSangria = pares.filter(([a, b]) => alumno[a].sangria === sol[b].sangria).length;
      const puntos = pares.length * 100 + conSangria;
      if (!mejor || puntos > mejor.puntos) mejor = { sol, pares, puntos };
    }

    const marcas = alumno.map(() => "lugar");
    for (const [a, b] of mejor.pares) {
      marcas[a] = alumno[a].sangria === mejor.sol[b].sangria ? "ok" : "sangria";
    }
    e.marcas = marcas;
    e.intentos++;

    const total = mejor.sol.length;
    const correcto = alumno.length === total && marcas.every((m) => m === "ok");

    if (correcto) {
      e.resuelto = true;
      resueltos.add(p.id);
      guardarResueltos();
      pintarLista();
      pintarTablero();
      mensajeResuelto();
      return;
    }

    const lugar = marcas.filter((m) => m === "lugar").length;
    const sangria = marcas.filter((m) => m === "sangria").length;
    const partes = [];
    if (lugar) {
      partes.push(["Rojo:", lugar === 1 ? "1 línea está fuera de lugar o sobra." : lugar + " líneas están fuera de lugar o sobran."]);
    }
    if (sangria) {
      partes.push(["Amarillo:", (sangria === 1 ? "1 línea está" : sangria + " líneas están") + " en buen orden, pero con la sangría incorrecta."]);
    }
    if (alumno.length < total) partes.push("Todavía faltan líneas por colocar.");
    else if (alumno.length > total) partes.push("Tu programa tiene líneas de más: no todas se usan.");
    if (!lugar && !sangria) partes.unshift("Lo que llevas va bien.");
    pintarTablero();
    mostrarMensaje("falta", partes);
  }

  function plural(n, palabra) {
    return n + " " + palabra + (n === 1 ? "" : "s");
  }

  function mensajeResuelto() {
    const p = actual();
    const e = estado();
    const partes = [["¡Correcto!", "Lo resolviste en " + plural(e.intentos, "intento") + "."]];
    if (p.observa) partes.push(["Observa:", p.observa]);
    if (resueltos.size === problemas.length) partes.push("Ya resolviste todos los problemas.");
    mostrarMensaje("bien", partes);
  }

  // ---------- Arrastre (ratón, lápiz y dedo) ----------

  let pendiente = null; // puntero presionado que aún no se mueve lo suficiente
  let arrastre = null;
  let ignorarClic = false;

  function alPresionar(ev) {
    if (ev.button !== 0 || arrastre) return;
    const li = ev.target.closest(".linea");
    if (!li) return;
    // Con el dedo solo se arrastra desde el asa, para no bloquear el desplazamiento.
    if (ev.pointerType === "touch" && !ev.target.closest(".asa")) return;
    pendiente = { li, x: ev.clientX, y: ev.clientY, id: ev.pointerId };
  }

  function iniciar(ev) {
    const li = pendiente.li;
    const r = li.getBoundingClientRect();
    const fantasma = li.cloneNode(true);
    fantasma.classList.add("fantasma");
    fantasma.classList.remove("seleccionada", "m-ok", "m-sangria", "m-lugar");
    fantasma.style.width = r.width + "px";
    document.body.appendChild(fantasma);

    const hueco = document.createElement("li");
    hueco.className = "hueco";
    hueco.style.height = r.height + "px";
    hueco.style.setProperty("--sangria", li.style.getPropertyValue("--sangria"));
    li.after(hueco);
    li.classList.add("oculta");

    arrastre = {
      i: Number(li.dataset.i),
      id: pendiente.id,
      dx: pendiente.x - r.left,
      dy: pendiente.y - r.top,
      fantasma,
      hueco,
      zona: li.parentElement,
      sangria: Number(li.style.getPropertyValue("--sangria")) || 0,
      x: ev.clientX,
      y: ev.clientY,
      cuadro: 0,
    };
    pendiente = null;
    document.body.classList.add("arrastrando");
    arrastre.cuadro = requestAnimationFrame(desplazar);
  }

  function dentro(el, x, y) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function ubicar() {
    const a = arrastre;
    a.fantasma.style.transform = "translate(" + (a.x - a.dx) + "px," + (a.y - a.dy) + "px)";

    if (dentro($("panel-programa"), a.x, a.y)) a.zona = programa;
    else if (dentro($("panel-banco"), a.x, a.y)) a.zona = banco;

    const lineas = [...a.zona.querySelectorAll(".linea:not(.oculta)")];
    const siguiente = lineas.find((l) => {
      const r = l.getBoundingClientRect();
      return a.y < r.top + r.height / 2;
    });
    if (a.hueco.parentElement !== a.zona || a.hueco.nextElementSibling !== (siguiente || null)) {
      a.zona.insertBefore(a.hueco, siguiente || null);
    }

    if (a.zona === programa) {
      const estilo = getComputedStyle(programa);
      const paso = parseFloat(estilo.getPropertyValue("--paso")) || 30;
      const origen = programa.getBoundingClientRect().left + parseFloat(estilo.paddingLeft);
      const nivel = Math.round((a.x - a.dx - origen) / paso);
      a.sangria = Math.max(0, Math.min(MAX_SANGRIA, nivel));
    } else {
      a.sangria = 0;
    }
    a.hueco.style.setProperty("--sangria", a.sangria);
  }

  // Desplaza la página cuando se arrastra cerca del borde superior o inferior.
  function desplazar() {
    if (!arrastre) return;
    const margen = 70;
    if (arrastre.y < margen) window.scrollBy(0, -10);
    else if (arrastre.y > window.innerHeight - margen) window.scrollBy(0, 10);
    ubicar();
    arrastre.cuadro = requestAnimationFrame(desplazar);
  }

  function alMover(ev) {
    if (pendiente && ev.pointerId === pendiente.id) {
      if (Math.hypot(ev.clientX - pendiente.x, ev.clientY - pendiente.y) < UMBRAL) return;
      iniciar(ev);
    }
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    ev.preventDefault();
    arrastre.x = ev.clientX;
    arrastre.y = ev.clientY;
    ubicar();
  }

  function terminar(soltar) {
    const a = arrastre;
    arrastre = null;
    cancelAnimationFrame(a.cuadro);
    document.body.classList.remove("arrastrando");
    let enfocar = null;
    if (soltar) {
      const antes = [...a.zona.children]
        .slice(0, [...a.zona.children].indexOf(a.hueco))
        .filter((el) => el.classList.contains("linea") && !el.classList.contains("oculta")).length;
      colocar(a.i, a.zona === programa ? "programa" : "banco", antes, a.sangria);
      enfocar = a.i;
    }
    a.fantasma.remove();
    pintarTablero(enfocar);
    ignorarClic = true;
    setTimeout(() => (ignorarClic = false), 0);
  }

  function alSoltar(ev) {
    if (pendiente && ev.pointerId === pendiente.id) pendiente = null;
    if (arrastre && ev.pointerId === arrastre.id) terminar(ev.type === "pointerup");
  }

  $("tablero").addEventListener("pointerdown", alPresionar);
  window.addEventListener("pointermove", alMover, { passive: false });
  window.addEventListener("pointerup", alSoltar);
  window.addEventListener("pointercancel", alSoltar);

  // ---------- Clics y teclado ----------

  $("tablero").addEventListener("click", (ev) => {
    if (ignorarClic) return;
    const li = ev.target.closest(".linea");
    if (li) alTocar(li);
  });

  $("tablero").addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && arrastre) return terminar(false);
    const li = ev.target.closest(".linea");
    if (!li) return;
    const i = Number(li.dataset.i);
    const enPrograma = li.parentElement === programa;
    let usado = true;
    if (ev.key === "Enter" || ev.key === " ") alTocar(li);
    else if (enPrograma && ev.key === "ArrowRight") sangrar(i, 1);
    else if (enPrograma && ev.key === "ArrowLeft") sangrar(i, -1);
    else if (enPrograma && ev.altKey && ev.key === "ArrowUp") subirBajar(i, -1);
    else if (enPrograma && ev.altKey && ev.key === "ArrowDown") subirBajar(i, 1);
    else if (enPrograma && (ev.key === "Delete" || ev.key === "Backspace")) devolver(i);
    else usado = false;
    if (usado) ev.preventDefault();
  });

  $("btn-menos").addEventListener("click", () => sangrar(seleccion, -1));
  $("btn-mas").addEventListener("click", () => sangrar(seleccion, 1));
  $("btn-quitar").addEventListener("click", () => devolver(seleccion));
  $("btn-revisar").addEventListener("click", revisar);
  $("btn-siguiente").addEventListener("click", () => irA(indice + 1));
  $("btn-reiniciar").addEventListener("click", () => {
    delete estados[actual().id];
    seleccion = null;
    ocultarMensaje();
    pintarTablero();
  });

  // Empieza en el primer problema sin resolver.
  const primero = problemas.findIndex((p) => !resueltos.has(p.id));
  irA(primero < 0 ? 0 : primero);
})();
