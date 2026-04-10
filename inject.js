//este script busca los arrays y los manda a la ventanita popup
var links = new Array();

//array para los XML
links[0] = new Array();
var elementos = document.getElementsByName("BtnDescarga");
//por cada elemento buscamos el texto adentro:
for (var i = 0; i < elementos.length; i++) {
  //buscamos en el HTML
  var textoOnclick = elementos[i].outerHTML;
  //buscamos la URL relativa con regex
  var urlRelativa = textoOnclick.match(/RecuperaCfdi[^']+/);
  //si la encontramos:
  if (urlRelativa && urlRelativa.length > 0) {
    var urlAbsoluta =
      "https://portalcfdi.facturaelectronica.sat.gob.mx/" + urlRelativa[0];
    links[0].push(urlAbsoluta);
  }
}

//array para los PDF
links[1] = new Array();
var elementosPdf = document.getElementsByName("BtnRI");

//por cada elemento buscamos el texto adentro:
for (var i = 0; i < elementosPdf.length; i++) {
  //buscamos en el HTML
  var textoOnclick = elementosPdf[i].outerHTML;
  //buscamos la URL relativa
  var urlRelativa = textoOnclick.match(
    /recuperaRepresentacionImpresa\(\'[^']+/
  );
  //si la encontramos:
  if (urlRelativa && urlRelativa.length > 0) {
    //extraemos el ID
    var id = urlRelativa[0].replace(/recuperaRepresentacionImpresa\(\'/g, "");
    var urlAbsoluta =
      "https://portalcfdi.facturaelectronica.sat.gob.mx/RepresentacionImpresa.aspx?Datos=" +
      id;
    links[1].push(urlAbsoluta);
  }
}

//array con los folios
links[2] = new Array();
var folios = document.getElementsByName("ListaFolios");
//por cada elemento buscamos la etiqueta "value"
for (var i = 0; i < folios.length; i++) {
  var folio = folios[i].attributes["value"].value;
  links[2].push(folio);
}

//enviamos el array de arrays a la ventanita, al listener
if (links[0].length > 0 || links[1].length > 0 || links[2].length > 0) {
  chrome.runtime.sendMessage({ action: "links_found", links: links });
}
