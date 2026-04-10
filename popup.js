var allLinks = [[], [], []];
var globalDirHandle = null; // Guarda la carpeta elegida para no volver a preguntar

async function descargarEnLote(tipo) {
    var extension = tipo === 'xml' ? '.xml' : '.pdf';
    var urls = tipo === 'xml' ? [...allLinks[0]] : [...allLinks[1]];
    var nombres = [...allLinks[2]];
    
    if (urls.length === 0) return;

    try {
        // 1. Solicitar el directorio al usuario (SOLO UNA VEZ)
        if (!globalDirHandle) {
            globalDirHandle = await window.showDirectoryPicker({
                id: 'cfdi_downloads',
                mode: 'readwrite'
            });
        }

        document.getElementById("status").textContent = "Iniciando descarga de " + urls.length + " " + tipo.toUpperCase() + "s...";

        // 2. Recorrer y descargar cada archivo
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            let nombre = nombres[i] || ("documento_" + i);
            let filename = nombre + extension;

            // Actualizar el texto en la ventanita para ver el progreso
            document.getElementById("status").textContent = `Descargando ${i + 1} de ${urls.length}: ${filename}`;

            // Descargar el archivo usando fetch (toma las credenciales del SAT automáticamente)
            let response = await fetch(url);
            if (!response.ok) {
                console.error("Error al descargar", url);
                continue; // Si uno falla, sigue con el próximo
            }
            let blob = await response.blob();

            // 3. Crear el archivo y guardarlo directamente en la carpeta elegida
            const fileHandle = await globalDirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        }

        document.getElementById("status").textContent = "¡Descarga de " + tipo.toUpperCase() + " finalizada con éxito!";
    } catch (err) {
        if (err.name === 'AbortError') {
            document.getElementById("status").textContent = "Selección de carpeta cancelada.";
        } else {
            console.error(err);
            document.getElementById("status").textContent = "Error: " + err.message;
        }
        // Reseteamos la variable por si hubo un error, para que vuelva a preguntar la próxima vez
        globalDirHandle = null; 
    }
}

// listener que recibe los enlaces de inject.js
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
