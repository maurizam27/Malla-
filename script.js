function toggleCurso(el) {
  el.classList.toggle("completado");
  guardarProgreso();
  calcularCreditos();
}

function calcularCreditos() {
  const cursos = document.querySelectorAll('.curso.completado');
  let total = 0;
  cursos.forEach(curso => {
    total += parseInt(curso.querySelector('.creditos').innerText);
  });
  document.getElementById('creditos-total').innerText = `Créditos completados: ${total}`;
}

function guardarProgreso() {
  const completados = [...document.querySelectorAll('.curso.completado')]
    .map(c => c.dataset.codigo);
  localStorage.setItem("cursosCompletados", JSON.stringify(completados));
}

function cargarProgreso() {
  const guardados = JSON.parse(localStorage.getItem("cursosCompletados") || "[]");
  guardados.forEach(codigo => {
    const curso = document.querySelector(`.curso[data-codigo="${codigo}"]`);
    if (curso) curso.classList.add("completado");
  });
  calcularCreditos();
}


document.addEventListener("DOMContentLoaded", cargarProgreso);