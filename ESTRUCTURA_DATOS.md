# Estructura de Datos - GameLab 📊

Esta es la especificación técnica de las estructuras JSON almacenadas en `localStorage` para el sistema GameLab.

## 1. Usuarios (`gamelab_usuarios`)
Almacena las credenciales y perfiles de acceso.

```json
[
  {
    "username": "admin",
    "password": "123",
    "role": "admin_general", 
    "name": "Alexander Smith"
  },
  {
    "username": "cajero",
    "password": "123",
    "role": "cajero",
    "name": "Keny Andre"
  }
]
```

## 2. Productos (`gamelab_productos`)
Catálogo completo de productos con control de stock.

```json
[
  {
    "id": "PROD-001",
    "nombre": "PlayStation 5 Slim (Disco)",
    "categoria": "Consolas",
    "precio": 2499.00,
    "stock": 12,
    "stockMinimo": 5,
    "estado": "Optimo" // Optimo, Stock Bajo, Agotado
  }
]
```

## 3. Ventas (`gamelab_ventas`)
Historial de transacciones realizadas en el POS.

```json
[
  {
    "id": "TRX-0001",
    "productos": [
      {
        "id": "PROD-001",
        "cantidad": 1,
        "precioUnit": 2499.00
      }
    ],
    "subtotal": 2117.80,
    "igv": 381.20,
    "total": 2499.00,
    "metodoPago": "Tarjeta", // Efectivo, Tarjeta, Yape/POS, QR
    "fecha": "2026-06-07T14:32:00Z"
  }
]
```

## 4. Alertas de Stock (`gamelab_alertas`)
Registro temporal de productos que requieren reposición inmediata.

```json
[
  {
    "id_producto": "PROD-003",
    "nombre": "Control DualSense White",
    "stock_actual": 0,
    "fecha_alerta": "2026-06-07T10:00:00Z",
    "prioridad": "Alta" // Alta (Agotado), Media (Bajo)
  }
]
```
