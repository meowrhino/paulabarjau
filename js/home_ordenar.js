proyectos.sort((a, b) => {
  // 1) Importancia: menor número = más importante
  if (a.importancia !== b.importancia) {
    return a.importancia - b.importancia; // 1 antes que 2, etc.
  }

  // 2) Dentro de la misma importancia, de más reciente a más viejo
  // Ojo: b - a para que el más nuevo vaya primero
  return new Date(b.fecha) - new Date(a.fecha);
});