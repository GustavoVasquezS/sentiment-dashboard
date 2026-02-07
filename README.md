# 🎯 Sentiment Dashboard

Dashboard interactivo para análisis de sentimientos en Español y Portugués.

## 📋 Descripción

Interfaz web desarrollada en React que consume la API de análisis de sentimientos desplegada en Render. Permite analizar textos de forma individual o por lotes, visualizando los resultados con gráficos interactivos.

## 🔗 API Backend

Este frontend consume la API desplegada en:
- **URL:** https://sentiment-api-render.onrender.com
- **Endpoints:**
  - `POST /predict` - Análisis individual
  - `POST /predict/batch` - Análisis por lotes
  - `GET /health` - Estado del servicio

## ✨ Características

- 📝 Análisis de texto individual
- 📋 Análisis por lotes (múltiples textos)
- 📊 Gráficos interactivos (distribución y confianza)
- 📜 Historial de análisis
- 🎨 Interfaz moderna con Glassmorphism
- 📱 Diseño responsive
- 🇪🇸🇧🇷 Soporte para Español y Portugués

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/sentiment_dashboard.git
cd sentiment_dashboard

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Dependencias

- **React 18** - Framework UI
- **Recharts** - Gráficos interactivos
- **Lucide React** - Iconos

## 🔧 Configuración

Para cambiar la URL de la API, edita el archivo `src/App.js`:

```javascript
const API_URL = 'https://sentiment-api-render.onrender.com';
```

## 🌐 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Build para producción
```bash
npm run build
```

## 📸 Funcionalidades

### Análisis Individual
- Ingresa un texto y obtén: sentimiento, probabilidad, indicador de revisión
- Botones de prueba rápida para diferentes sentimientos

### Análisis por Lotes
- Ingresa múltiples textos (uno por línea)
- Obtén resumen con conteo de positivos/negativos/neutros
- Lista detallada de resultados

### Estadísticas
- Gráfico de distribución (Pie Chart)
- Gráfico de confianza por análisis (Bar Chart)
- Historial con timestamps

## 📄 Licencia

MIT License

## 🤝 Créditos

- **API ML:** FastAPI + scikit-learn (TF-IDF + Logistic Regression)
- **Frontend inspirado en:** [Alexandracleto/sentimientos](https://github.com/Alexandracleto/sentimientos)
