# app.py (Versión con búsqueda robusta por palabras)

from flask import Flask, request, jsonify, render_template
import pytesseract
from PIL import Image
import io
import pandas as pd
import traceback
import os
import re # <-- Importamos el módulo de expresiones regulares para limpiar el texto

# --- CONFIGURACIÓN DE TESSERACT ---
pytesseract.pytesseract.tesseract_cmd = r'D:\tesseract\tesseract.exe'
tessdata_dir_config = r'--tessdata-dir D:\tesseract\tessdata'


# --- Carga de datos ---
try:
    df_sustancias = pd.read_csv('sustancias.csv', encoding='latin-1')
    df_sustancias['nombre_lower'] = df_sustancias['Nombre'].str.lower()
    print("El archivo sustancias.csv se cargó correctamente.")
except FileNotFoundError:
    df_sustancias = pd.DataFrame()

app = Flask(__name__)

# --- RUTAS ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/reporte')
def show_report():
    return render_template('reporte.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró ningún archivo'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400

    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        texto_extraido = pytesseract.image_to_string(image, lang='spa')
        print(f"--- Texto Original Extraído ---\n{texto_extraido}\n-----------------------------")

        # --- ¡NUEVA LÓGICA DE BÚSQUEDA MEJORADA! ---

        # 1. Limpiamos el texto extraído: lo ponemos en minúsculas y reemplazamos
        #    comas, puntos y saltos de línea por espacios.
        texto_limpio = re.sub(r'[,\.\n]', ' ', texto_extraido.lower())
        
        # 2. Convertimos el texto limpio en un conjunto (set) de palabras únicas para una búsqueda súper rápida.
        palabras_extraidas = set(texto_limpio.split())
        print(f"Palabras extraídas para la búsqueda: {palabras_extraidas}")

        # 3. Iteramos sobre nuestra base de datos y comparamos.
        sustancias_encontradas = []
        if not df_sustancias.empty:
            for index, row in df_sustancias.iterrows():
                # Ahora comprobamos si el nombre de la sustancia está en nuestro conjunto de palabras.
                if row['nombre_lower'] in palabras_extraidas:
                    print(f"¡COINCIDENCIA ENCONTRADA!: {row['Nombre']}")
                    info_sustancia = {
                        'nombre': row['Nombre'],
                        'categoria': row['Categoría'],
                        'descripcion': row['Declaración de seguridad']
                    }
                    sustancias_encontradas.append(info_sustancia)
        
        return jsonify({
            'texto_completo': texto_extraido,
            'sustancias_encontradas': sustancias_encontradas
        })

    except Exception as e:
        print(f"ERROR: {traceback.format_exc()}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)