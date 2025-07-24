document.addEventListener('DOMContentLoaded', () => {
    console.log("Página de reporte cargada.");
    const reportContentDiv = document.getElementById('report-content');

    // 1. Recuperar los datos del reporte guardados en sessionStorage
    const reportDataString = sessionStorage.getItem('reportData');

    if (!reportDataString) {
        reportContentDiv.innerHTML = '<p class="error-text">No se encontraron datos para generar el reporte. Por favor, regresa y analiza una imagen primero.</p>';
        return;
    }

    try {
        const data = JSON.parse(reportDataString);
        console.log("Datos del reporte recuperados:", data);
        
        // 2. Construir el reporte con los datos
        buildReport(data);

        // 3. (Opcional) Limpiar los datos para que no se muestren si se recarga la página
        sessionStorage.removeItem('reportData');

    } catch (error) {
        console.error("Error al parsear los datos del reporte:", error);
        reportContentDiv.innerHTML = '<p class="error-text">Hubo un error al leer los datos del reporte.</p>';
    }
});

function buildReport(data) {
    const reportContentDiv = document.getElementById('report-content');
    reportContentDiv.innerHTML = ''; // Limpiar el mensaje de "cargando"

    // --- SECCIÓN DE SUSTANCIAS ENCONTRADAS ---
    const sustanciasSeccion = document.createElement('div');
    sustanciasSeccion.className = 'reporte-seccion';
    
    let sustanciasHTML = '<h2>Sustancias Encontradas</h2>';
    if (data.sustancias_encontradas && data.sustancias_encontradas.length > 0) {
        data.sustancias_encontradas.forEach(sustancia => {
            const categoriaClass = `categoria-${sustancia.categoria.toLowerCase()}`;
            sustanciasHTML += `
                <div class="sustancia-card-report ${categoriaClass}">
                    <div class="card-header">
                        <h3>${sustancia.nombre}</h3>
                        <span class="category-badge ${categoriaClass}">
                            Categoría ${sustancia.categoria}
                        </span>
                    </div>
                    <p class="card-description">${sustancia.descripcion}</p>
                </div>
            `;
        });
    } else {
        sustanciasHTML += '<p>No se encontraron sustancias de nuestra lista en el texto de la imagen.</p>';
    }
    sustanciasSeccion.innerHTML = sustanciasHTML;
    reportContentDiv.appendChild(sustanciasSeccion);

    // --- SECCIÓN GUÍA DE CATEGORÍAS ---
    const guiaSeccion = document.createElement('div');
    guiaSeccion.className = 'reporte-seccion';
    guiaSeccion.innerHTML = `
        <h2>Guía de Categorías de Riesgo en el Embarazo (FDA)</h2>
        <p class="guia-descripcion">
            Esta es una guía de referencia. <strong>Siempre consulta a un profesional de la salud</strong> antes de tomar cualquier decisión sobre tu medicación.
        </p>
        <div class="categoria-info categoria-a"><strong>A: Sin Riesgo Demostrado</strong> - Estudios adecuados no han mostrado riesgo para el feto.</div>
        <div class="categoria-info categoria-b"><strong>B: Sin Evidencia de Riesgo</strong> - Estudios en animales no han mostrado riesgo, pero no hay estudios controlados en humanos.</div>
        <div class="categoria-info categoria-c"><strong>C: Riesgo no Descartado</strong> - Estudios en animales han mostrado efectos adversos; usar solo si el beneficio justifica el riesgo.</div>
        <div class="categoria-info categoria-d"><strong>D: Evidencia de Riesgo</strong> - Hay evidencia de riesgo fetal, pero los beneficios pueden ser aceptables en situaciones graves.</div>
        <div class="categoria-info categoria-x"><strong>X: Contraindicado</strong> - El riesgo de uso en mujeres embarazadas supera claramente cualquier posible beneficio.</div>
    `;
    reportContentDiv.appendChild(guiaSeccion);

    // --- SECCIÓN TEXTO COMPLETO ---
    const textoSeccion = document.createElement('div');
    textoSeccion.className = 'reporte-seccion';
    textoSeccion.innerHTML = `
        <h2>Texto Completo Extraído de la Imagen</h2>
        <pre class="result-box">${data.texto_completo || 'No se pudo extraer texto.'}</pre>
    `;
    reportContentDiv.appendChild(textoSeccion);
}