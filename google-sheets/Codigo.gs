// Recibe los resultados de "Arma el programa" y agrega un renglón por alumno
// en la primera pestaña de esta hoja de cálculo.

const ENCABEZADOS = [
  "Recibido", "Nombre", "Matrícula", "Tiempo", "Segundos", "Revisiones",
  "Problemas", "Terminó", "Intentos por problema", "ID",
];

function doPost(e) {
  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(ENCABEZADOS);
      hoja.setFrozenRows(1);
    }
    // Si la página reintenta el envío, el mismo resultado no se repite.
    const ids = hoja.getRange(1, ENCABEZADOS.length, hoja.getLastRow(), 1).getValues().flat();
    if (!ids.includes(d.id)) {
      hoja.appendRow([
        new Date(), texto(d.nombre), texto(d.matricula), texto(d.tiempo), Number(d.segundos),
        Number(d.revisiones), texto(d.problemas), new Date(d.fin), texto(d.intentos), texto(d.id),
      ]);
    }
    return respuesta({ ok: true });
  } catch (error) {
    return respuesta({ ok: false, error: String(error) });
  } finally {
    candado.releaseLock();
  }
}

// Abrir la URL en el navegador sirve para comprobar que la aplicación está publicada.
function doGet() {
  return respuesta({ ok: true, mensaje: "El registro de resultados funciona." });
}

// Lo que escribe el alumno se guarda como texto, nunca como fórmula.
function texto(valor) {
  const t = String(valor == null ? "" : valor).slice(0, 200);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
