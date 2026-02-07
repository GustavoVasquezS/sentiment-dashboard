# 🎯 Sentiment Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Recharts](https://img.shields.io/badge/Recharts-2.12-FF6384?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

**Dashboard interactivo para análisis de sentimientos en Español y Portugués**

[Demo en Producción](https://sentiment-dashboard-pi.vercel.app) · [API Docs](https://sentiment-api-render.onrender.com/docs)

</div>

---

## 🌐 URLs de Producción

| Servicio | URL |
|----------|-----|
| **Frontend (este repo)** | https://sentiment-dashboard-pi.vercel.app |
| **Backend Java** | https://sentiment-backend-java-production.up.railway.app |
| **ML API Python** | https://sentiment-api-render.onrender.com |

---

## 📖 Descripción

Interfaz web moderna desarrollada en **React 18** que consume tanto la API de Machine Learning (Python/FastAPI) como el Backend Java (Spring Boot). Permite realizar análisis de sentimientos de forma individual o por lotes, gestionar productos por categorías, y visualizar estadísticas con gráficos interactivos.

### ✨ Características Principales

| Funcionalidad | Descripción |
|---------------|-------------|
| 🔐 **Autenticación** | Registro e inicio de sesión con JWT |
| 📝 **Análisis Individual** | Analiza un texto y obtén sentimiento + confianza |
| 📋 **Análisis por Lotes** | Múltiples textos (uno por línea) |
| 📊 **Análisis CSV** | Carga archivos CSV con columnas de texto y categoría |
| 📈 **Comparativas** | Análisis por período, producto y categoría |
| 🗂️ **Gestión de Productos** | CRUD de categorías y productos |
| 📜 **Historial** | Sesiones persistentes para usuarios registrados |
| 🎨 **UI Moderna** | Glassmorphism, gradientes, animaciones |
| 📱 **Responsive** | Adaptable a desktop, tablet y móvil |
| 🇪🇸🇧🇷 **Multiidioma** | Soporte para español y portugués |

---

## 🚀 Instalación Local

### Requisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/GustavoVasquezS/sentiment-dashboard.git
cd sentiment-dashboard

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# API de Machine Learning (Python/FastAPI)
REACT_APP_PYTHON_API_URL=https://sentiment-api-render.onrender.com

# Backend Java (Spring Boot) - Para autenticación y gestión
REACT_APP_JAVA_API_URL=https://sentiment-backend-java-production.up.railway.app/project/api/v2
```

### Para desarrollo local:

```env
REACT_APP_PYTHON_API_URL=http://localhost:8000
REACT_APP_JAVA_API_URL=http://localhost:8080/project/api/v2
```

---

## 📁 Estructura del Proyecto

```
sentiment_dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js              # Componente principal (toda la lógica)
│   ├── index.js            # Entry point
│   └── index.css           # Estilos Tailwind
├── .env                    # Variables de entorno (no commitear)
├── .env.example            # Plantilla de variables
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## ☁️ Despliegue en Vercel

### Opción 1: CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Producción
vercel --prod
```

### Opción 2: GitHub Integration

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar repositorio de GitHub
3. Configurar variables de entorno en Settings > Environment Variables:
   - `REACT_APP_PYTHON_API_URL` = `https://sentiment-api-render.onrender.com`
   - `REACT_APP_JAVA_API_URL` = `https://sentiment-backend-java-production.up.railway.app/project/api/v2`
4. Deploy automático en cada push a `main`

### Build para producción (manual)

```bash
npm run build
# Los archivos estáticos estarán en /build
```

---

## 🔧 Funcionalidades Detalladas

### 🔐 Autenticación
- **Registro:** Nombre, apellido, email, contraseña
- **Login:** Email + contraseña → Token JWT
- **Sesión persistente:** Token guardado en localStorage
- **Modo invitado:** Acceso limitado sin registro

### 📝 Análisis Individual (Tab "Individual")
- Ingresa un texto (mín. 5 caracteres)
- Resultado: Sentimiento, probabilidad, indicador de revisión
- Gráfico donut con distribución
- Botones de prueba rápida

### 📋 Análisis por Lotes (Tab "Por Lotes")
- Múltiples textos (uno por línea)
- Resumen: Conteo de positivos/negativos/neutros
- Lista detallada con cada resultado
- Gráficos de distribución y confianza

### 📊 Análisis CSV (Tab "CSV")
- Carga archivo CSV con columnas:
  - `comentario` o `texto`: El texto a analizar
  - `categoria` (opcional): Para agrupar resultados
- Exportación de resultados a CSV
- Asociación con productos existentes

### 📈 Comparativas (Tab "Comparativas")
- **Por Período:** Análisis histórico en rango de fechas
- **Por Producto:** Sentimientos agrupados por producto
- **Por Categoría:** Distribución por categorías

### 🗂️ Gestión (Tab "Gestión")
- CRUD de Categorías
- CRUD de Productos (asociados a categorías)
- Solo para usuarios autenticados

---

## 📦 Dependencias Principales

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| react | 18.2+ | Framework UI |
| recharts | 2.12+ | Gráficos interactivos |
| lucide-react | 0.300+ | Iconos modernos |
| tailwindcss | 3.4+ | Framework CSS utility-first |

---

## 🔗 Repositorios Relacionados

| Componente | Repositorio | Descripción |
|------------|-------------|-------------|
| Backend Java | [sentiment-backend-java](https://github.com/GustavoVasquezS/sentiment-backend-java) | API Gateway con JWT |
| ML API Python | [sentiment-api-render](https://github.com/GustavoVasquezS/sentiment-api-render) | Modelo de ML |

---

## 🧪 Testing

### Credenciales de prueba
```
Email: testcsv@test.com
Password: test123
```

### Textos de prueba
- **Positivo:** "Este producto es excelente, me encanta!"
- **Negativo:** "Pésimo servicio, muy decepcionado"
- **Neutro:** "El producto llegó, funciona normal"

---

## 📄 Licencia

MIT License

---

## 🙏 Agradecimientos

Este proyecto fue posible gracias al esfuerzo colaborativo y el apoyo de múltiples actores:

### Al Programa Hackathon ONE - No Country

Agradecemos profundamente a **No Country** por:
- Proporcionar un espacio de aprendizaje colaborativo y desafiante
- Fomentar el trabajo en equipo interdisciplinario
- Crear oportunidades para desarrolladores de toda Latinoamérica
- Impulsar proyectos que resuelven problemas reales con tecnología

### Al Equipo No Data - No Code

Agradecimiento especial al equipo **No Data - No Code** por el extraordinario trabajo realizado durante la Hackathon:

- **Alexandra Cleto** - Por su repositorio de referencia [sentimientos](https://github.com/Alexandracleto/sentimientos/tree/Ale-dev) que sirvió como inspiración y base para el diseño de este dashboard. Su trabajo incluye:
  - Diseño UI moderno con Glassmorphism y gradientes
  - Integración con Recharts para visualización de datos
  - Estructura de componentes React reutilizables
  
- **Jonathan Tuppia** - Por su repositorio de referencia [SentimentAPI](https://github.com/Jona-9/SentimentAPI) y por liderar el deploy de los tres frentes en local y la presentación exitosa en el Demo Day.
- **Francisco Llendo** - Por desarrollar el modelo de ML v4.0 disponible en [Sentimental_API_No_Data_No_Code_Semana_4](https://github.com/GustavoVasquezS/Sentimental_API_No_Data_No_Code_Semana_4).

### Al Equipo de Desarrollo

**Frontend Team (React/Tailwind)**:
- Por crear una interfaz intuitiva que hace accesible la complejidad del análisis
- Por implementar gráficos interactivos con Recharts
- Por el diseño responsive adaptable a múltiples dispositivos

**Backend Team (Java/Spring Boot)**:
- Por la implementación robusta del sistema de autenticación JWT
- Por los endpoints de gestión de productos y sesiones

**Data Science Team (Python/FastAPI)**:
- Por desarrollar un modelo de ML preciso y eficiente
- Por los endpoints de predicción rápidos y confiables

### A la Comunidad Open Source

Especial reconocimiento a los mantenedores de:
- **React** - Por el framework UI declarativo y eficiente
- **Tailwind CSS** - Por el sistema de diseño utility-first
- **Recharts** - Por los componentes de gráficos basados en React
- **Lucide** - Por los iconos modernos y accesibles

### A los Futuros Usuarios y Contribuidores

Si este proyecto te resultó útil, considera:
- ⭐ **Dar una estrella** al repositorio en GitHub
- 🐛 **Reportar bugs** o sugerir mejoras a través de Issues
- 🔧 **Contribuir** con Pull Requests
- 📢 **Compartir** el proyecto con otros desarrolladores

---

<div align="center">

**⭐ Si este proyecto te ayudó, considera darle una estrella ⭐**

**🚀 Happy Coding! 🚀**

---

*Sentiment Dashboard v4.0 - Hackathon ONE 2026*

</div>
