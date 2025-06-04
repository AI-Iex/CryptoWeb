// Función que obtiene la configuración del tema y otras opciones del widget de TradingView
function getThemeConfig() {
    // Obtiene los estilos computados (CSS variables) del elemento raíz del documento
    const root = getComputedStyle(document.documentElement);

    // Verifica el tema almacenado en localStorage.
    const isDarkTheme = localStorage.getItem('theme') === 'light-theme' ? false : true;

    // Obtiene el color del fondo
    const backgroundColor = root.getPropertyValue(
        isDarkTheme ? '--chart-dark-bg' : '--chart-light-bg'
    ).trim();

    // Obtiene el color de las líneas del grid
    const gridColor = root.getPropertyValue(
        isDarkTheme ? '--chart-dark-border' : '--chart-light-border'
    ).trim();

    // Retorna un objeto de configuración para el widget de TradingView
    return {
        autosize: true,                             // El gráfico se ajusta automáticamente al contenedor
        symbol: "BINANCE:BTCUSDT",                  // Par de criptomonedas a mostrar (Bitcoin/USDT en Binance)
        interval: "4H",                             // Intervalo de velas (4 horas)
        timezone: "Etc/UTC",                        // Zona horaria
        theme: isDarkTheme ? 'dark' : 'light',      // Tema del gráfico según el modo oscuro/claro
        style: "1",                                 // Estilo del gráfico (1 = gráfico de velas)
        locale: "en",                               // Idioma de la interfaz
        container_id: "chart-widget",               // ID del contenedor donde se cargará el gráfico
        backgroundColor: backgroundColor,           // Color de fondo personalizado
        gridColor: gridColor,                       // Color del grid personalizado
        hide_side_toolbar: false,                   // Muestra la barra lateral de herramientas
        allow_symbol_change: true,                  // Permite cambiar el par de criptomonedas desde el gráfico
        save_image: true,                           // Permite guardar el gráfico como imagen
        details: true,                              // Muestra detalles del activo
        calendar: false,                            // Oculta el calendario económico
        support_host: "https://www.tradingview.com" // Host de soporte de TradingView
    };
}

// Inicializa el widget de TradingView con la configuración adecuada
function initializeWidget() {

    // Obtiene la configuración según el tema
    const widgetConfig = getThemeConfig(); 

    // Llama a una función externa que inserta el widget en el DOM
    createWidget(
        'chart-widget', // ID del contenedor
        widgetConfig,   // Configuración del gráfico
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js' // Script del widget
    );
}

// Llama a la función para inicializar el widget al cargar el script
initializeWidget();
