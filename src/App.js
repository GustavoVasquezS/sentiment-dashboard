import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  MessageSquare, TrendingUp, AlertCircle, CheckCircle, Send, Loader2, 
  RefreshCw, LogIn, LogOut, User, FolderOpen, Sparkles, Zap, Activity, 
  BarChart3, Target, History, Upload, Download, FileText, Eye, Trash2,
  ChevronDown, ChevronUp, Calendar, Package, Layers
} from 'lucide-react';
import './index.css';

// ============================================================
// Configuración de APIs
// ============================================================
const JAVA_API_URL = process.env.REACT_APP_JAVA_API_URL || 'http://localhost:8080/project/api/v2';
const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || 'https://sentiment-api-render.onrender.com';

function App() {
  // ============================================================
  // Estados de Autenticación
  // ============================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: ''
  });

  // ============================================================
  // Estados de la Aplicación
  // ============================================================
  const [text, setText] = useState('');
  const [batchText, setBatchText] = useState('');
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('single');

  // Estados para datos del backend Java
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);

  // ============================================================
  // NUEVOS Estados para CSV y Comparativas
  // ============================================================
  const [csvData, setCsvData] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvAnalysisResult, setCsvAnalysisResult] = useState(null);
  const [historialPersistente, setHistorialPersistente] = useState([]);
  const [comparativaProductos, setComparativaProductos] = useState([]);
  const [comparativaCategorias, setComparativaCategorias] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [showSesionDetail, setShowSesionDetail] = useState(false);

  // ============================================================
  // Efectos
  // ============================================================
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      loadCategorias();
      loadHistorialPersistente();
      loadComparativas();
    }
  }, [isAuthenticated, token, user]);

  // ============================================================
  // Funciones de Autenticación
  // ============================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JAVA_API_URL}/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: authForm.correo,
          contrasena: authForm.contrasena
        })
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();
      setToken(data.token);
      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setSuccess('¡Bienvenido ' + data.nombre + '!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JAVA_API_URL}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al registrar');
      }

      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setAuthMode('login');
      setAuthForm({ ...authForm, nombre: '', apellido: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCategorias([]);
    setProductos([]);
    setHistorialPersistente([]);
    setComparativaProductos([]);
    setComparativaCategorias([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ============================================================
  // Funciones de carga de datos
  // ============================================================
  const loadCategorias = async () => {
    try {
      const response = await fetch(`${JAVA_API_URL}/categoria`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  const loadProductos = async (categoriaId) => {
    try {
      const response = await fetch(`${JAVA_API_URL}/producto/por-categoria?categoriaId=${categoriaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  const loadHistorialPersistente = async () => {
    try {
      const response = await fetch(`${JAVA_API_URL}/sesion/historial`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistorialPersistente(data);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  const loadComparativas = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${JAVA_API_URL}/csv/comparativa-productos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${JAVA_API_URL}/csv/comparativa-categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setComparativaProductos(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setComparativaCategorias(catData);
      }
    } catch (err) {
      console.error('Error cargando comparativas:', err);
    }
  };

  // ============================================================
  // Análisis de Sentimientos (Individual)
  // ============================================================
  const analyzeSingle = async () => {
    if (!text.trim() || text.length < 5) {
      setError('El texto debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PYTHON_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) throw new Error('Error en la API');

      const data = await response.json();
      setResult(data);
      addToHistory(text, data);
    } catch (err) {
      setError('Error al conectar con la API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBatch = async () => {
    const texts = batchText.split('\n').filter(t => t.trim().length >= 5);

    if (texts.length === 0) {
      setError('Ingresa al menos un texto válido (mínimo 5 caracteres por línea)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PYTHON_API_URL}/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });

      if (!response.ok) throw new Error('Error en la API');

      const data = await response.json();
      const combined = texts.map((t, i) => ({
        text: t.substring(0, 60) + (t.length > 60 ? '...' : ''),
        fullText: t,
        ...data.results[i]
      }));

      setBatchResults(combined);

      // Guardar en BD si está autenticado
      if (user && token) {
        try {
          await fetch(`${JAVA_API_URL}/sesion/analizar`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comentarios: texts })
          });
          loadHistorialPersistente();
        } catch (e) {
          console.error('Error guardando sesión:', e);
        }
      }

      const positivos = combined.filter(r => r.prevision === 'Positivo').length;
      const negativos = combined.filter(r => r.prevision === 'Negativo').length;
      const neutros = combined.filter(r => r.prevision === 'Neutro').length;

      setHistory(prev => [{
        text: `Lote: ${texts.length} textos`,
        prevision: `+${positivos} -${negativos} ~${neutros}`,
        probabilidad: combined.reduce((acc, r) => acc + r.probabilidad, 0) / combined.length,
        review_required: false,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError('Error al conectar con la API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (inputText, data) => {
    setHistory(prev => [{
      text: inputText.trim().substring(0, 50) + (inputText.length > 50 ? '...' : ''),
      ...data,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 9)]);
  };

  // ============================================================
  // NUEVO: Funciones de CSV
  // ============================================================
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('El archivo CSV debe tener al menos una fila de encabezado y una de datos');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const catIndex = headers.findIndex(h => h.includes('categ'));
      const prodIndex = headers.findIndex(h => h.includes('product') || h.includes('nombre'));
      const comentIndex = headers.findIndex(h => h.includes('coment') || h.includes('texto') || h.includes('review'));

      if (catIndex === -1 || prodIndex === -1 || comentIndex === -1) {
        setError('El CSV debe contener columnas: categoria, producto/nombre, comentario/texto');
        return;
      }

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= Math.max(catIndex, prodIndex, comentIndex) + 1) {
          const categoria = values[catIndex]?.trim();
          const producto = values[prodIndex]?.trim();
          const comentario = values[comentIndex]?.trim();
          
          if (categoria && producto && comentario) {
            rows.push({ categoria, producto, comentario });
          }
        }
      }

      if (rows.length === 0) {
        setError('No se encontraron filas válidas en el CSV');
        return;
      }

      setCsvData(rows);
      setCsvPreview(rows.slice(0, 5));
      setError(null);
      setSuccess(`CSV cargado: ${rows.length} comentarios detectados`);
      setTimeout(() => setSuccess(null), 3000);
    };

    reader.readAsText(file);
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const analyzeCsv = async () => {
    if (csvData.length === 0) {
      setError('Primero carga un archivo CSV');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JAVA_API_URL}/csv/analizar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rows: csvData })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error al analizar CSV');
      }

      const data = await response.json();
      setCsvAnalysisResult(data);
      setSuccess(`¡Análisis completado! ${data.totalComentarios} comentarios procesados`);
      
      // Recargar datos
      loadHistorialPersistente();
      loadComparativas();
      loadCategorias();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Error al analizar CSV: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCsv = () => {
    setCsvData([]);
    setCsvPreview([]);
    setCsvAnalysisResult(null);
  };

  // ============================================================
  // NUEVO: Funciones de Exportación
  // ============================================================
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      setError('No hay datos para exportar');
      return;
    }

    let csvContent = '';
    
    if (data[0].comentario !== undefined) {
      // Exportar comentarios
      csvContent = 'Texto,Sentimiento,Probabilidad\n';
      data.forEach(item => {
        csvContent += `"${item.texto || item.comentario}","${item.sentimiento || item.prevision}",${item.probabilidad}\n`;
      });
    } else if (data[0].nombreProducto !== undefined) {
      // Exportar productos
      csvContent = 'Producto,Categoria,Total,Positivos,Negativos,Neutros,%Positivo\n';
      data.forEach(item => {
        csvContent += `"${item.nombreProducto}","${item.categoria}",${item.totalComentarios},${item.positivos},${item.negativos},${item.neutrales},${item.porcentajePositivo?.toFixed(1)}%\n`;
      });
    } else if (data[0].nombreCategoria !== undefined) {
      // Exportar categorías
      csvContent = 'Categoria,Total,Positivos,Negativos,Neutros,%Positivo\n';
      data.forEach(item => {
        csvContent += `"${item.nombreCategoria}",${item.totalComentarios},${item.positivos},${item.negativos},${item.neutrales},${item.porcentajePositivo?.toFixed(1)}%\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setSuccess('Archivo CSV exportado correctamente');
    setTimeout(() => setSuccess(null), 3000);
  };

  const exportToPDF = (data, title) => {
    // Crear contenido HTML para el PDF
    let htmlContent = `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #6366f1; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #6366f1; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .neutral { color: #f59e0b; }
          .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>📊 ${title}</h1>
        <p>Fecha de exportación: ${new Date().toLocaleString()}</p>
    `;

    if (data.productos && data.productos.length > 0) {
      // Reporte de análisis CSV
      htmlContent += `
        <div class="summary">
          <h3>Resumen General</h3>
          <p>Total comentarios: <strong>${data.totalComentarios}</strong></p>
          <p>Positivos: <span class="positive">${data.totalPositivos}</span> | 
             Negativos: <span class="negative">${data.totalNegativos}</span> | 
             Neutros: <span class="neutral">${data.totalNeutrales}</span></p>
          <p>Score promedio: ${(data.avgScore * 100).toFixed(1)}%</p>
        </div>

        <h2>Por Producto</h2>
        <table>
          <tr><th>Producto</th><th>Categoría</th><th>Total</th><th>Positivos</th><th>Negativos</th><th>% Positivo</th></tr>
          ${data.productos.map(p => `
            <tr>
              <td>${p.nombreProducto}</td>
              <td>${p.categoria}</td>
              <td>${p.totalComentarios}</td>
              <td class="positive">${p.positivos}</td>
              <td class="negative">${p.negativos}</td>
              <td>${p.porcentajePositivo?.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    htmlContent += '</body></html>';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ============================================================
  // Helpers
  // ============================================================
  const testTexts = [
    { label: '✓ Positiva', text: 'Este producto es excelente, me encanta!', color: 'green' },
    { label: '✗ Negativa', text: 'Pésimo servicio, muy decepcionado', color: 'red' },
    { label: '◐ Neutral', text: 'El producto llegó en el tiempo indicado', color: 'amber' },
    { label: '🇧🇷 Português', text: 'Muito bom produto, adorei a qualidade!', color: 'blue' }
  ];

  const getStatsData = () => {
    const data = activeTab === 'batch' ? batchResults : history;
    const positivos = data.filter(r => r.prevision === 'Positivo').length;
    const negativos = data.filter(r => r.prevision === 'Negativo').length;
    const neutros = data.filter(r => r.prevision === 'Neutro' || (typeof r.prevision === 'string' && r.prevision.includes('~'))).length;
    
    return [
      { name: 'Positivo', value: positivos, color: '#10b981', percentage: data.length > 0 ? ((positivos/data.length)*100).toFixed(1) : 0 },
      { name: 'Negativo', value: negativos, color: '#ef4444', percentage: data.length > 0 ? ((negativos/data.length)*100).toFixed(1) : 0 },
      { name: 'Neutro', value: neutros, color: '#f59e0b', percentage: data.length > 0 ? ((neutros/data.length)*100).toFixed(1) : 0 }
    ];
  };

  const getConfidenceData = () => {
    const data = activeTab === 'batch' ? batchResults : history;
    return data.slice(0, 10).map((item, index) => ({
      name: `#${index + 1}`,
      confianza: Math.round(item.probabilidad * 100)
    })).reverse();
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positivo': return '#10b981';
      case 'negativo': return '#ef4444';
      case 'neutro': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positivo': return '😊';
      case 'negativo': return '😞';
      case 'neutro': return '😐';
      default: return '❓';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-2xl border border-gray-100">
          <p className="text-gray-800 font-semibold mb-1">{label}</p>
          <p className="text-indigo-600 font-bold text-lg">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  // ============================================================
  // Render: Pantalla de Login/Registro
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-4 rounded-2xl shadow-2xl">
                  <Sparkles className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  SentimentAPI
                </h1>
                <p className="text-purple-300 text-sm font-medium tracking-wider">POWERED BY AI</p>
              </div>
            </div>
            <p className="text-purple-200 text-lg max-w-xl mx-auto">
              Análisis de sentimientos en tiempo real con inteligencia artificial
            </p>
          </header>

          {/* Auth Form */}
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="glass-card p-8 w-full max-w-md">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    authMode === 'login' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <LogIn size={18} />
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    authMode === 'register' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <User size={18} />
                  Registrarse
                </button>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                {authMode === 'register' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Nombre</label>
                      <input
                        type="text"
                        value={authForm.nombre}
                        onChange={(e) => setAuthForm({...authForm, nombre: e.target.value})}
                        className="input-field"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 text-sm font-medium mb-2">Apellido</label>
                      <input
                        type="text"
                        value={authForm.apellido}
                        onChange={(e) => setAuthForm({...authForm, apellido: e.target.value})}
                        className="input-field"
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-purple-200 text-sm font-medium mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={authForm.correo}
                    onChange={(e) => setAuthForm({...authForm, correo: e.target.value})}
                    className="input-field"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-purple-200 text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={authForm.contrasena}
                    onChange={(e) => setAuthForm({...authForm, contrasena: e.target.value})}
                    className="input-field"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 mb-4 bg-red-500/20 border border-red-400/40 rounded-xl text-red-300">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-4 mb-4 bg-green-500/20 border border-green-400/40 rounded-xl text-green-300">
                    <CheckCircle size={18} />
                    {success}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {authMode === 'login' ? <LogIn size={20} /> : <User size={20} />}
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-purple-300 text-sm">o continúa sin cuenta</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-purple-200 font-medium transition-all"
              >
                Usar como Invitado
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Dashboard Principal
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  SentimentAPI
                </h1>
                <p className="text-purple-300 text-xs">Dashboard de Análisis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/40 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">API Conectada</span>
              </div>
              
              {user && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <User size={16} />
                  <span className="text-sm">{user.nombre} {user.apellido}</span>
                </div>
              )}

              {user && (
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-full text-red-300 transition-all">
                  <LogOut size={16} />
                  Salir
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        {(success || error) && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            {success && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-500/20 border border-green-400/40 rounded-xl text-green-300 mb-4">
                <CheckCircle size={18} />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center gap-2 p-4 bg-red-500/20 border border-red-400/40 rounded-xl text-red-300 mb-4">
                <AlertCircle size={18} />
                {error}
                <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-200">✕</button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {[
              { id: 'single', label: 'Análisis Individual', icon: MessageSquare },
              { id: 'batch', label: 'Análisis por Lotes', icon: TrendingUp },
              ...(user ? [
                { id: 'csv', label: 'Cargar CSV', icon: Upload },
                { id: 'comparativas', label: 'Comparativas', icon: BarChart3 },
                { id: 'historial', label: 'Historial', icon: History }
              ] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-900 shadow-xl'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ============================================================ */}
            {/* TAB: ANÁLISIS INDIVIDUAL */}
            {/* ============================================================ */}
            {activeTab === 'single' && (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-400/20 rounded-lg">
                      <Zap className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Analizador en Vivo</h2>
                      <p className="text-sm text-purple-300">Obtén resultados instantáneos con IA</p>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={2000}
                      placeholder="Escribe aquí el texto que deseas analizar..."
                      className="input-field h-40 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-purple-500/30 rounded-lg text-sm text-purple-200">
                      {text.length}/2000
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-purple-300 self-center">Prueba rápida:</span>
                    {testTexts.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setText(t.text)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105
                          ${t.color === 'green' ? 'sentiment-positive' : ''}
                          ${t.color === 'red' ? 'sentiment-negative' : ''}
                          ${t.color === 'amber' ? 'sentiment-neutral' : ''}
                          ${t.color === 'blue' ? 'bg-blue-500/20 border-2 border-blue-400/40 text-blue-300' : ''}
                        `}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={analyzeSingle}
                    disabled={loading || !text.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Analizar Sentimiento
                      </>
                    )}
                  </button>
                </div>

                {result && (
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-400/20 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-purple-300" />
                      </div>
                      <h2 className="text-xl font-bold">Resultado del Análisis</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div 
                        className="p-6 rounded-xl text-center border-2"
                        style={{
                          backgroundColor: getSentimentColor(result.prevision) + '20',
                          borderColor: getSentimentColor(result.prevision)
                        }}
                      >
                        <div className="text-sm opacity-75 mb-2">SENTIMIENTO</div>
                        <div className="text-5xl mb-2">{getSentimentEmoji(result.prevision)}</div>
                        <div 
                          className="text-2xl font-bold uppercase"
                          style={{ color: getSentimentColor(result.prevision) }}
                        >
                          {result.prevision}
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border-2 border-indigo-400/40 text-center">
                        <div className="text-sm text-indigo-300 mb-2">CONFIANZA</div>
                        <div className="text-4xl font-bold text-white">{(result.probabilidad * 100).toFixed(1)}%</div>
                        <div className="mt-3 bg-white/10 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000 rounded-full"
                            style={{ width: `${result.probabilidad * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {result.review_required ? (
                      <div className="flex items-center justify-center gap-2 p-4 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                        <AlertCircle size={18} />
                        Baja confianza - Se recomienda revisión manual
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 p-4 bg-green-500/20 border border-green-400/40 rounded-xl text-green-300">
                        <CheckCircle size={18} />
                        Alta confianza - Clasificación automática confiable
                      </div>
                    )}
                  </div>
                )}

                {loading && !result && (
                  <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mb-2">Analizando contenido...</p>
                    <p className="text-purple-300">Procesando con IA avanzada</p>
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: ANÁLISIS POR LOTES */}
            {/* ============================================================ */}
            {activeTab === 'batch' && (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-400/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Análisis por Lotes</h2>
                      <p className="text-sm text-purple-300">Analiza múltiples textos a la vez</p>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <textarea
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      placeholder="Ingresa un texto por línea...&#10;Ejemplo:&#10;Este producto es excelente&#10;Muy mala experiencia&#10;Normal, cumple su función"
                      className="input-field h-56 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-purple-500/30 rounded-lg text-sm text-purple-200">
                      {batchText.split('\n').filter(t => t.trim()).length} textos
                    </div>
                  </div>

                  <button
                    onClick={analyzeBatch}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando Lote...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Analizar Lote
                      </>
                    )}
                  </button>
                </div>

                {batchResults.length > 0 && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Resultados ({batchResults.length} textos)</h2>
                      <button
                        onClick={() => exportToCSV(batchResults.map(r => ({
                          texto: r.fullText,
                          sentimiento: r.prevision,
                          probabilidad: r.probabilidad
                        })), 'analisis_lote')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
                      >
                        <Download size={16} />
                        Exportar CSV
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="stat-card text-center">
                        <div className="text-3xl font-black text-green-600">
                          {batchResults.filter(r => r.prevision === 'Positivo').length}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">Positivos</div>
                      </div>
                      <div className="stat-card text-center">
                        <div className="text-3xl font-black text-red-600">
                          {batchResults.filter(r => r.prevision === 'Negativo').length}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">Negativos</div>
                      </div>
                      <div className="stat-card text-center">
                        <div className="text-3xl font-black text-amber-600">
                          {batchResults.filter(r => r.prevision === 'Neutro').length}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">Neutros</div>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {batchResults.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                          <span className="text-2xl">{getSentimentEmoji(r.prevision)}</span>
                          <span className="flex-1 text-sm text-purple-100 truncate">{r.text}</span>
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                            style={{ backgroundColor: getSentimentColor(r.prevision) }}
                          >
                            {(r.probabilidad * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: CARGAR CSV (Solo usuarios registrados) */}
            {/* ============================================================ */}
            {activeTab === 'csv' && user && (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-400/20 rounded-lg">
                      <Upload className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Cargar CSV</h2>
                      <p className="text-sm text-purple-300">Importa comentarios con categorías y productos</p>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-purple-200 mb-2">📋 Formato esperado del CSV:</h3>
                    <code className="text-xs text-cyan-300 block bg-black/30 p-3 rounded-lg">
                      categoria,producto,comentario<br/>
                      Electrónicos,iPhone 15,Excelente celular muy rápido<br/>
                      Electrónicos,iPhone 15,Muy caro para lo que ofrece<br/>
                      Ropa,Nike Air Max,Muy cómodas las zapatillas
                    </code>
                  </div>

                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                      <Upload className="w-10 h-10 text-purple-300 mb-2" />
                      <span className="text-purple-200">Click para seleccionar archivo CSV</span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCsvUpload}
                      />
                    </label>
                  </div>

                  {csvData.length > 0 && (
                    <>
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-green-300">
                            ✅ {csvData.length} comentarios listos para analizar
                          </span>
                          <button
                            onClick={clearCsv}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={analyzeCsv}
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analizando CSV...
                          </>
                        ) : (
                          <>
                            <Zap size={20} />
                            Analizar {csvData.length} Comentarios
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Preview y Resultados */}
                {(csvPreview.length > 0 || csvAnalysisResult) && (
                  <div className="glass-card p-6">
                    {csvPreview.length > 0 && !csvAnalysisResult && (
                      <>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Eye size={18} />
                          Vista Previa (primeros 5)
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {csvPreview.map((row, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg text-sm">
                              <div className="flex gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-purple-500/30 rounded text-purple-200">{row.categoria}</span>
                                <span className="px-2 py-0.5 bg-cyan-500/30 rounded text-cyan-200">{row.producto}</span>
                              </div>
                              <p className="text-purple-100 truncate">{row.comentario}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {csvAnalysisResult && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold">📊 Resultados del Análisis</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => exportToCSV(csvAnalysisResult.productos, 'productos_analisis')}
                              className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-all"
                            >
                              <Download size={14} />
                              CSV
                            </button>
                            <button
                              onClick={() => exportToPDF(csvAnalysisResult, 'Reporte de Análisis de Sentimientos')}
                              className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-all"
                            >
                              <FileText size={14} />
                              PDF
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-6">
                          <div className="stat-card text-center">
                            <div className="text-2xl font-black text-gray-800">{csvAnalysisResult.totalComentarios}</div>
                            <div className="text-gray-600 text-xs">Total</div>
                          </div>
                          <div className="stat-card text-center">
                            <div className="text-2xl font-black text-green-600">{csvAnalysisResult.totalPositivos}</div>
                            <div className="text-gray-600 text-xs">Positivos</div>
                          </div>
                          <div className="stat-card text-center">
                            <div className="text-2xl font-black text-red-600">{csvAnalysisResult.totalNegativos}</div>
                            <div className="text-gray-600 text-xs">Negativos</div>
                          </div>
                          <div className="stat-card text-center">
                            <div className="text-2xl font-black text-amber-600">{csvAnalysisResult.totalNeutrales}</div>
                            <div className="text-gray-600 text-xs">Neutros</div>
                          </div>
                        </div>

                        <h4 className="font-semibold mb-3 text-purple-200">Por Producto:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {csvAnalysisResult.productos?.map((prod, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <span className="font-medium">{prod.nombreProducto}</span>
                                <span className="text-purple-400 text-sm ml-2">({prod.categoria})</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400">{prod.positivos}+</span>
                                <span className="text-red-400">{prod.negativos}-</span>
                                <span className="px-2 py-1 bg-white/10 rounded text-sm">
                                  {prod.porcentajePositivo?.toFixed(0)}% ✓
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: COMPARATIVAS (Solo usuarios registrados) */}
            {/* ============================================================ */}
            {activeTab === 'comparativas' && user && (
              <>
                {/* Comparativa de Productos */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-400/20 rounded-lg">
                        <Package className="w-6 h-6 text-purple-300" />
                      </div>
                      <h2 className="text-xl font-bold">Comparativa de Productos</h2>
                    </div>
                    {comparativaProductos.length > 0 && (
                      <button
                        onClick={() => exportToCSV(comparativaProductos, 'comparativa_productos')}
                        className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
                      >
                        <Download size={14} />
                        CSV
                      </button>
                    )}
                  </div>

                  {comparativaProductos.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={comparativaProductos.slice(0, 6)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="nombreProducto" stroke="#a78bfa" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#a78bfa" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Legend />
                          <Bar dataKey="positivos" name="Positivos" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="negativos" name="Negativos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="neutrales" name="Neutros" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {comparativaProductos.map((prod, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                            <span>{prod.nombreProducto}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-300">{prod.totalComentarios} total</span>
                              <span className={`px-2 py-0.5 rounded ${prod.porcentajePositivo >= 60 ? 'bg-green-500/30 text-green-300' : prod.porcentajePositivo >= 40 ? 'bg-amber-500/30 text-amber-300' : 'bg-red-500/30 text-red-300'}`}>
                                {prod.porcentajePositivo?.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-purple-300">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay datos de productos</p>
                      <p className="text-sm mt-2">Carga un CSV para ver comparativas</p>
                    </div>
                  )}
                </div>

                {/* Comparativa de Categorías */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-400/20 rounded-lg">
                        <Layers className="w-6 h-6 text-cyan-300" />
                      </div>
                      <h2 className="text-xl font-bold">Comparativa de Categorías</h2>
                    </div>
                    {comparativaCategorias.length > 0 && (
                      <button
                        onClick={() => exportToCSV(comparativaCategorias, 'comparativa_categorias')}
                        className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
                      >
                        <Download size={14} />
                        CSV
                      </button>
                    )}
                  </div>

                  {comparativaCategorias.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={comparativaCategorias}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ nombreCategoria, porcentajePositivo }) => `${nombreCategoria}: ${porcentajePositivo?.toFixed(0)}%`}
                            outerRadius={90}
                            innerRadius={50}
                            dataKey="totalComentarios"
                            paddingAngle={3}
                          >
                            {comparativaCategorias.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="mt-4 space-y-2">
                        {comparativaCategorias.map((cat, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][i % 5] }}></div>
                              {cat.nombreCategoria}
                            </span>
                            <span className="text-purple-300">{cat.totalComentarios} comentarios</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-purple-300">
                      <Layers size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay datos de categorías</p>
                      <p className="text-sm mt-2">Carga un CSV para ver comparativas</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: HISTORIAL PERSISTENTE (Solo usuarios registrados) */}
            {/* ============================================================ */}
            {activeTab === 'historial' && user && (
              <div className="col-span-full glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-400/20 rounded-lg">
                      <History className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Historial de Análisis</h2>
                      <p className="text-sm text-purple-300">Tus sesiones de análisis guardadas</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadHistorialPersistente}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
                  >
                    <RefreshCw size={16} />
                    Actualizar
                  </button>
                </div>

                {historialPersistente.length > 0 ? (
                  <div className="space-y-3">
                    {historialPersistente.map((sesion, i) => (
                      <div key={i} className="bg-white/5 rounded-xl overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                          onClick={() => {
                            setSelectedSesion(selectedSesion === i ? null : i);
                            setShowSesionDetail(selectedSesion !== i);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <Calendar className="text-purple-400" size={20} />
                            <div>
                              <span className="font-semibold">{sesion.fecha}</span>
                              <span className="text-purple-300 text-sm ml-3">
                                {sesion.total} comentarios
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                                +{sesion.positivos}
                              </span>
                              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                                -{sesion.negativos}
                              </span>
                              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-sm">
                                ~{sesion.neutrales}
                              </span>
                            </div>
                            {selectedSesion === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                        
                        {selectedSesion === i && sesion.comentarios && (
                          <div className="border-t border-white/10 p-4 bg-white/5">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-purple-300">
                                Promedio de confianza: {(sesion.avgScore * 100).toFixed(1)}%
                              </span>
                              <button
                                onClick={() => exportToCSV(sesion.comentarios.map(c => ({
                                  texto: c.texto,
                                  sentimiento: c.sentimiento,
                                  probabilidad: c.probabilidad
                                })), `sesion_${sesion.fecha}`)}
                                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
                              >
                                <Download size={12} />
                                Exportar
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {sesion.comentarios.map((com, j) => (
                                <div key={j} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg text-sm">
                                  <span className="text-lg">{getSentimentEmoji(com.sentimiento)}</span>
                                  <span className="flex-1 truncate text-purple-100">{com.texto}</span>
                                  <span 
                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                    style={{ 
                                      backgroundColor: getSentimentColor(com.sentimiento) + '30',
                                      color: getSentimentColor(com.sentimiento)
                                    }}
                                  >
                                    {(com.probabilidad * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-purple-300">
                    <History size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No hay sesiones de análisis guardadas</p>
                    <p className="text-sm mt-2">Realiza análisis por lotes o carga un CSV</p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* GRÁFICOS DE ESTADÍSTICAS (para tabs single/batch) */}
            {/* ============================================================ */}
            {(activeTab === 'single' || activeTab === 'batch') && (history.length > 0 || batchResults.length > 0) && (
              <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Distribución de Sentimientos</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getStatsData().filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={90}
                        innerRadius={50}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {getStatsData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Confianza por Análisis</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getConfidenceData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="confianza" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Historial de sesión (para invitados y usuarios) */}
            {(activeTab === 'single' || activeTab === 'batch') && history.length > 0 && (
              <div className="col-span-full glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-400/20 rounded-lg">
                      <History className="w-6 h-6 text-purple-300" />
                    </div>
                    <h2 className="text-xl font-bold">Historial de Sesión</h2>
                  </div>
                  <button 
                    onClick={() => setHistory([])}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
                  >
                    <RefreshCw size={16} />
                    Limpiar
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                      <span className="text-purple-400 text-sm">{item.timestamp}</span>
                      <span className="flex-1 text-sm truncate">{item.text}</span>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                        style={{ 
                          backgroundColor: typeof item.prevision === 'string' && item.prevision.includes('+') 
                            ? '#6b7280' 
                            : getSentimentColor(item.prevision) 
                        }}
                      >
                        {item.prevision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-purple-300">
              Powered by <span className="text-white font-semibold">Spring Boot</span> + 
              <span className="text-white font-semibold"> FastAPI</span> + 
              <span className="text-white font-semibold"> scikit-learn</span>
            </p>
            <p className="text-purple-400 text-sm mt-1">
              Backend Java + Modelo ML Python • Hackathon 2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
