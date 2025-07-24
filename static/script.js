// static/script.js (Reemplaza el archivo completo)

document.addEventListener('DOMContentLoaded', () => {
    const uploader = document.getElementById('uploader');
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const processButton = document.getElementById('processButton');
    const statusDiv = document.getElementById('status');

    let selectedFile = null;

    uploader.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(selectedFile);
            statusDiv.textContent = '';
        }
    });

    processButton.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Por favor, selecciona una imagen primero.');
            return;
        }

        statusDiv.textContent = 'Analizando, por favor espera...';
        processButton.disabled = true;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error del servidor: ${response.status}`);
            }
            
            // --- ¡ESTE ES EL CAMBIO CLAVE! ---
            // 1. Guardar los datos en el almacenamiento de la sesión del navegador
            sessionStorage.setItem('reportData', JSON.stringify(data));

            // 2. Redirigir al usuario a la nueva página de reporte
            window.location.href = '/reporte';

        } catch (error) {
            console.error('Error:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            processButton.disabled = false; // Habilitar el botón si hay error
        }
    });
});