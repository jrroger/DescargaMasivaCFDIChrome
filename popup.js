var allLinks = [[], [], []];

function descargarEnLote(tipo) {
    var carpetaInput = document.getElementById("carpeta").value.trim();
    var carpeta = carpetaInput ? (carpetaInput + "/") : "";
    var extension = tipo === 'xml' ? '.xml' : '.pdf';
    var urls = tipo === 'xml' ? [...allLinks[0]] : [...allLinks[1]];
    var nombres = [...allLinks[2]];
    
    if (urls.length === 0) return;

    document.getElementById("status").textContent = "Descargando " + urls.length + " " + tipo.toUpperCase() + "s...";

    // Descargar en lote con un pequeño retraso para no saturar el navegador
    var delay = 100; 
    urls.forEach((url, index) => {
        setTimeout(() => {
            var nombre = nombres[index] || ("documento_" + index);
            chrome.downloads.download({
                url: url,
                filename: carpeta + nombre + extension,
                saveAs: false // Forzar que no pregunte si es posible
            });
            
            if (index === urls.length - 1) {
                document.getElementById("status").textContent = "¡Descarga de " + tipo.toUpperCase() + " finalizada!";
            }
        }, index * delay);
    });
}

//listener que recibe los elaces de inject.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "links_found") {
        allLinks = request.links;
        document.getElementById("cuenta-xml").innerText = allLinks[0].length;
        document.getElementById("cuenta-pdf").innerText = allLinks[1].length;
    }
});

window.onload = function() {
    document.getElementById("descargarxml").onclick = function() { descargarEnLote('xml'); };
    document.getElementById("descargarpdf").onclick = function() { descargarEnLote('pdf'); };

    document.getElementById("analizar").onclick = function() {
        chrome.tabs.create({ url: "https://analizador-cfdi.netlify.app/" });
    };
    document.getElementById("iralsat").onclick = function() {
        chrome.tabs.create({ url: "https://portalcfdi.facturaelectronica.sat.gob.mx" });
    };
    document.getElementById("enlace").onclick = function() {
        chrome.tabs.create({ url: "https://eduardoarandah.github.io/" });
    };
    document.getElementById("manual").onclick = function() {
        chrome.tabs.create({ url: "https://github.com/eduardoarandah/DescargaMasivaCFDIChrome" });
    };

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        if (activeTab && activeTab.url.startsWith("https://portalcfdi.facturaelectronica.sat.gob.mx")) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["inject.js"]
            });
        } else {
            document.getElementById("status").textContent = "Abre el portal del SAT para usar la extensión.";
        }
    });
};
