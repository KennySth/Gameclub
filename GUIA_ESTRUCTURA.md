# Guía de Estructura - Gameclub 🎮

Esta es la estructura oficial del proyecto para que todo el equipo esté sincronizado. Cada archivo tiene un responsable asignado.

```text
src/
├── index.html              # Punto de entrada (Login y Layout Principal) - [Keny Andre]
├── assets/                 # Imágenes, logos y recursos compartidos
├── css/
│   ├── layout.css          # Estilos de Sidebar y Estructura - [Keny Andre]
│   ├── global.css          # Colores, tipografía y utilidades
│   └── components.css      # Botones, tablas y modales estándar
├── js/
│   ├── core/               # Lógica compartida
│   │   └── storage.js      # CRUD de localStorage (get/set/delete) - [Alexander Smith]
│   ├── auth/               # Módulo Login
│   │   └── login.js        # Lógica de autenticación - [Keny Andre]
│   ├── modules/            # Lógica de cada módulo funcional
│   │   ├── dashboard.js    # KPIs y alertas de stock - [Fabricio Alexander]
│   │   ├── pos.js          # Ventas, carrito y pagos - [Katherine Patricia]
│   │   ├── inventory.js    # CRUD de productos y filtros - [Kenny Sthiven]
│   │   └── reports.js      # Gráficos y exportación de datos - [Alexander Smith]
│   └── app.js              # Orquestador: navegación y carga de vistas
└── views/                  # Fragmentos HTML (Carga dinámica dentro de index.html)
    ├── dashboard.html      # Estructura del panel de control y KPIs - [Fabricio Alexander]
    ├── pos.html            # Interfaz de punto de venta y carrito - [Katherine Patricia]
    ├── inventory.html      # Gestión de stock y tablas de productos - [Kenny Sthiven]
    └── reports.html        # Visualización de métricas y gráficos - [Alexander Smith]
```

## Resumen de Responsabilidades
- **Keny Andre:** Módulo Login + estructura base (index.html, sidebar, navegación).
- **Fabricio Alexander:** Módulo Dashboard (Tarjetas KPI, últimas ventas).
- **Katherine Patricia:** Módulo Ventas POS (Buscador, carrito, pagos).
- **Kenny Sthiven:** Módulo Stock / Inventario (Tabla, CRUD, Modales).
- **Alexander Smith:** Módulo Reportes + Funciones globales de LocalStorage.
