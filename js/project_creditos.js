const lang = "es"; // "en" o "cat"
const data = /* el JSON de arriba */;
const creditos = data.creditos;

creditos.forEach(item => {
  const titulo = item.titulo[lang];
  const nombre = item.nombre;
  const link = item.link;

  // Ejemplo creando un <li>
  const li = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = titulo + " ";

  if (link) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.textContent = nombre;
    li.appendChild(strong);
    li.appendChild(a);
  } else {
    li.textContent = `${titulo} ${nombre}`;
  }

  document.querySelector("#creditos").appendChild(li);
});