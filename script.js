function toggleCurso(el) {
  el.classList.toggle("completado");
  guardarProgreso();
  calcularCreditos();
  verificarRequisitos(); // 🔑 Verifica qué cursos deben bloquearse o desbloquearse
}

function calcularCreditos() {
  const todosLosCursos = document.querySelectorAll('.curso');
  const cursosCompletados = document.querySelectorAll('.curso.completado');
  let totalCreditos = 0;

  cursosCompletados.forEach(curso => {
    totalCreditos += parseFloat(curso.querySelector('.creditos').innerText);
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
  const cursos = document.querySelectorAll(".curso.completado");
  const codigos = Array.from(cursos).map(curso => curso.dataset.codigo);
  localStorage.setItem("cursosCompletados", JSON.stringify(codigos));
}

function cargarProgreso() {
  const guardados = JSON.parse(localStorage.getItem("cursosCompletados") || "[]");
  guardados.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso) curso.classList.add("completado");
  });
  calcularCreditos();
  verificarRequisitos(); // 🔧 Esto DEBE ir aquí
}

function verificarRequisitos() {
  const completados = JSON.parse(localStorage.getItem("cursosCompletados") || "[]");

  // Calculamos créditos totales aprobados
  let creditosAprobados = 0;
  completados.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso) {
      const creditos = parseFloat(curso.querySelector('.creditos')?.innerText || "0");
      creditosAprobados += creditos;
    }
  });

  document.querySelectorAll('.curso').forEach(curso => {
    const requisitos = curso.dataset.requiere;
    const creditosMin = parseFloat(curso.dataset.creditosMin || "0");
    const candadoExistente = curso.querySelector('.candado');

    // Verificamos prerrequisitos por cursos
    let cumpleRequisitos = true;
    if (requisitos) {
      const codigos = requisitos.split(',').map(c => c.trim());
      cumpleRequisitos = codigos.every(req => completados.includes(req));
    }

    // Verificamos crédito mínimo
    const cumpleCreditos = creditosAprobados >= creditosMin;

    if (cumpleRequisitos && cumpleCreditos) {
      curso.classList.remove("bloqueado");
      curso.title = "";
      if (candadoExistente) candadoExistente.remove();
    } else {
      curso.classList.add("bloqueado");
      curso.title = "";

      let tooltip = [];
      if (!cumpleRequisitos && requisitos) tooltip.push("Requiere cursos: " + requisitos);
      if (!cumpleCreditos && creditosMin > 0) tooltip.push(`Mínimo ${creditosMin} créditos`);

      curso.title = tooltip.join(" | ");

      if (!candadoExistente) {
        const icono = document.createElement("span");
        icono.classList.add("candado");
        icono.textContent = "🔒";
        curso.appendChild(icono);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", cargarProgreso);