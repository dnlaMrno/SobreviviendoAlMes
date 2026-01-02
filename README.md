# 💸 Sobreviviendo al Mes


# Deploy: https://sobreviviendo-al-mes.vercel.app/

<img src="/assets/dashboardSobreviviendoAlMes.png" alt="Dashboard img">

Un dashboard financiero personal, moderno y directo para llevar el control de tus ingresos y gastos mensuales sin complicaciones. Olvídate de excels aburridos; esto es visual, rápido, responsivo y funciona directamente en tu navegador.

✨ Características Principales

Control Doble de Ingresos: Gestiona dos fuentes de dinero por separado (ej. Sueldo Principal y Bonos/Extras) con visualización clara de saldos.

Modo Oscuro (Dark Mode): 🌙 Detecta automáticamente la preferencia de tu sistema e incluye un interruptor manual para cuidar tu vista.

Gestión de Ahorros:

Mensual: Cálculo automático de lo que te sobra mes a mes.

Histórico: Visualiza tu "Imperio" acumulado sumando los ahorros de todos los meses registrados.

Control de Gastos Inteligente:

Alerta de "Gastos Hormiga": 🐜 Te avisa con un popup y una alerta visual si tus gastos en salidas, comida o vicios superan los $100,000.

Filtros por Categoría: Encuentra rápidamente cuánto gastaste en Supermercado, Casa, etc.

Edición Completa: ✏️ ¿Te equivocaste? Edita monto, concepto, ícono y origen del dinero sin tener que borrar y crear de nuevo.

Interfaz Responsiva & Acordeones: Diseño optimizado para móviles que organiza la información en tarjetas desplegables para evitar el scroll infinito.

Formatos Automáticos: Los campos de dinero se formatean solos con comas y decimales para evitar errores de lectura.

Exportación a PDF: Genera reportes profesionales con resumen de saldos, total gastado y detalle de movimientos.

Privacidad Total: Todos los datos se guardan en el LocalStorage de tu navegador. Nada sale de tu dispositivo.

🚀 Cómo Usar

Abrir: Abre el archivo index.html en tu navegador favorito.

Configurar Ingresos: Despliega las tarjetas de "Sueldo" y "Bono" para ingresar tus montos mensuales.

Registrar Gastos:

Elige el origen (Sueldo o Bono).

Ingresa concepto, monto e ícono.

¡Listo! Los saldos se actualizan en tiempo real.

Analizar:

Usa el filtro de arriba de la tabla para ver gastos específicos.

Observa la tarjeta de "Ahorro" para ver tu progreso global.

Gestionar:

Usa el ✏️ para corregir errores.

Usa el 🗑️ para eliminar registros.

Cambia de mes con las flechas < > en la barra superior.

🎨 Personalización

Puedes adaptar los colores a tu gusto editando las variables CSS al inicio del archivo index.html:

:root {
    --color-primary: #4F46E5;   /* Color Principal */
    --color-secondary: #0EA5E9; /* Color Secundario */
    --color-tertiary: #10B981;  /* Color de Ahorro */
    --color-bg: #f3f4f6;        /* Fondo (Modo Claro) */
}


🛠️ Tecnologías

HTML5 & CSS3

Tailwind CSS (vía CDN) para estilos, responsividad y modo oscuro.

JavaScript (Vanilla) para toda la lógica de negocio y persistencia.

FontAwesome para los iconos.

html2pdf.js para la generación de reportes.

Google Fonts (Tipografía 'Inter').