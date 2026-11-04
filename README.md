# OCR Texto a QR - Leroy Merlin

Aplicación web para escanear códigos de Leroy Merlin (que comienzan por `991`) mediante la cámara del dispositivo, extraer el número con OCR y generar su código QR correspondiente.

## Funcionalidades

- Acceso a cámara trasera del dispositivo
- Captura de imagen desde la cámara
- Preprocesamiento de imagen (escala de grises, desenfoque) para mejorar el reconocimiento OCR
- Reconocimiento OCR con [Tesseract.js](https://tesseract.projectnaptha.com/)
- Filtrado de códigos con formato `991` + 14 dígitos
- Generación de códigos QR con [qrcode](https://github.com/soldair/node-qrcode)
- Optimizado para uso móvil

## Tecnologías

- [Webpack](https://webpack.js.org/) - Bundler
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR
- [QRCode.js](https://github.com/soldair/node-qrcode) - Generación de QR
- Vanilla JavaScript, HTML5, CSS3

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Build para producción
npm run build
```

## Uso

1. Abrir la aplicación
2. Pulsar el botón de cámara para dar permisos
3. Enfocar el código de Leroy Merlin
4. Capturar la imagen
5. Se generará automáticamente el código QR si se detecta un código válido

## Notas

Los códigos buscados siguen el patrón `\b991\d{14}\b` (991 seguido de 14 dígitos).
