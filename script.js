function toggleCurso(el) {
  if (el.classList.contains("completado")) {
    el.classList.remove("completado");
    el.classList.add("progreso");
  } else if (el.classList.contains("progreso")) {
    el.classList.remove("progreso");
  } else {
    el.classList.add("completado");
    el.classList.remove("progreso");
  }

  guardarProgreso();
  calcularCreditos();
  verificarRequisitos();
}

function calcularCreditos() {
  const todosLosCursos = document.querySelectorAll('.curso');
  const cursosCompletados = document.querySelectorAll('.curso.completado');
  let totalCreditos = 0;

  cursosCompletados.forEach(curso => {
    totalCreditos += parseFloat(curso.querySelector('.creditos')?.innerText || "0");
  });

  const totalCursos = todosLosCursos.length;
  const completados = cursosCompletados.length;
  const porcentaje = ((completados / totalCursos) * 100).toFixed(2);

  document.getElementById('creditos-total').innerText = `Créditos aprobados: ${totalCreditos.toFixed(2)}`;
  document.getElementById('cursos-aprobados').innerText = `Cursos aprobados: ${completados}`;
  document.getElementById('avance-carrera').innerText = `Avance en la carrera: ${porcentaje}%`;

  const barra = document.querySelector(".barra-progreso .relleno");
  barra.style.width = `${porcentaje}%`;
}

function guardarProgreso() {
  const completados = Array.from(document.querySelectorAll(".curso.completado")).map(c => c.dataset.codigo);
  const enProgreso = Array.from(document.querySelectorAll(".curso.progreso")).map(c => c.dataset.codigo);
  localStorage.setItem("cursosCompletados", JSON.stringify(completados));
  localStorage.setItem("cursosProgreso", JSON.stringify(enProgreso));
}

function cargarProgreso() {
  const completados = JSON.parse(localStorage.getItem("cursosCompletados") || "[]");
  const enProgreso = JSON.parse(localStorage.getItem("cursosProgreso") || "[]");

  completados.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso) curso.classList.add("completado");
  });

  enProgreso.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso && !curso.classList.contains("completado")) curso.classList.add("progreso");
  });

  calcularCreditos();
  verificarRequisitos();
}

function verificarRequisitos() {
  const completados = JSON.parse(localStorage.getItem("cursosCompletados") || "[]");
  const enProgreso = JSON.parse(localStorage.getItem("cursosProgreso") || "[]");

  let creditosAprobados = 0;
  completados.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso) {
      const creditos = parseFloat(curso.querySelector('.creditos')?.innerText || "0");
      if (!isNaN(creditos)) creditosAprobados += creditos;
    }
  });

  document.querySelectorAll('.curso').forEach(curso => {
    const codigo = curso.dataset.codigo;
    const requisitos = curso.dataset.requiere;
    const corequisitos = curso.dataset.corequiere;
    const creditosMin = parseFloat(curso.dataset.creditosMin || "0");

    const codigosRequisitos = requisitos ? requisitos.split(',').map(c => c.trim()) : [];
    const codigosCorequisitos = corequisitos ? corequisitos.split(',').map(c => c.trim()) : [];

    const cumpleRequisitos = codigosRequisitos.every(req => completados.includes(req));
    const cumpleCorequisitos = codigosCorequisitos.every(req => completados.includes(req) || enProgreso.includes(req));
    const coreqEnProgreso = codigosCorequisitos.some(req => enProgreso.includes(req));
    const cumpleCreditos = creditosAprobados >= creditosMin;

    const habilitado = cumpleRequisitos && cumpleCorequisitos && cumpleCreditos;

    // ⚠️ Bloquear cursos que no cumplen
    if (!habilitado) {
      curso.classList.add("bloqueado");
      curso.classList.remove("habilitado-por-corequisito");

      // Eliminar ícono si existe
      const ic = curso.querySelector(".corequisito");
      if (ic) ic.remove();

      // Quitar estado si estaba marcado
      curso.classList.remove("completado", "progreso");

      // Tooltip informativo
      curso.title = `Requiere: ${requisitos || "-"}${corequisitos ? ` | Corequiere: ${corequisitos}` : ""}`;
      return;
    }

    // ✅ Curso habilitado
    curso.classList.remove("bloqueado");
    curso.title = "";

    // Mostrar ícono 🔁 si algún corequisito está en progreso
    if (cumpleCorequisitos && codigosCorequisitos.length > 0 && coreqEnProgreso) {
      curso.classList.add("habilitado-por-corequisito");

      if (!curso.querySelector('.corequisito')) {
        const icono = document.createElement("span");
        icono.classList.add("corequisito");
        icono.textContent = "🔁";
        curso.appendChild(icono);
      }
    } else {
      curso.classList.remove("habilitado-por-corequisito");
      const ic = curso.querySelector('.corequisito');
      if (ic) ic.remove();
    }
  });

  calcularCreditos();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProgreso();

  document.querySelectorAll(".curso").forEach(curso => {
    curso.addEventListener("click", () => toggleCurso(curso));
  });
});
