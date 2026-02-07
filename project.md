---
title: Master PRD - CosechaData & Sabor de Plaza
tags: PRD, MVP, React, Python, Data Engineering
description: Documento de requerimientos unificado para Backend (Engine) y Frontend (SPA).
---

# 📋 Master PRD: CosechaData & Sabor de Plaza (Full Stack MVP)

:::info
**Estado:** Borrador (v1.0)  
**Stakeholders:** Product Owner, Dev Team  
**Región:** Medellín, Colombia (3 Plazas Específicas)
:::

[TOC]

---

## 1. Contexto del Proyecto

Estamos construyendo **CosechaData**, una plataforma de inteligencia de mercados agrícolas para Medellín, Colombia. El sistema tiene dos componentes principales que deben interactuar (o simular interacción en esta fase):

1.  **Backend Engine (CosechaData):** Procesa datos del DANE (SIPSA) para encontrar caídas de precio significativas.
2.  **Frontend SPA (Sabor de Plaza):** Una interfaz React para visualizar estas oportunidades de ahorro y atraer al consumidor final.

---

## 2. Tech Stack & Restricciones

| Área | Tecnología Sugerida |
| :--- | :--- |
| **Frontend** | React + Vite (TypeScript), Tailwind CSS |
| **Backend Logic** | Python (Pandas para lógica de negocio) |
| **Visualización** | Chart.js + `react-chartjs-2` |
| **Iconografía** | Lucide-react |
| **Fuente de Datos** | DANE (SIPSA) vía SOAP (Simulado en MVP Frontend) |

---

## 3. Especificaciones del Backend (Lógica de Negocio)

> **Nota:** El Frontend debe consumir un JSON que respete la siguiente estructura lógica derivada del Engine de Alertas.

### 3.1 Fuentes de Datos (Geografía)
El sistema **solo** procesa datos de:
* Central Mayorista de Antioquia.
* Plaza Minorista "José María Villa".
* Placita de Flórez.

### 3.2 Taxonomía de Productos
Los productos se agrupan estrictamente en 4 categorías:

| ID | Categoría | Ejemplos |
| :--- | :--- | :--- |
| `FRU` | **Frutas** | Mango, Lulo, Mora, Maracuyá |
| `GRN` | **Granos** | Frijol Cargamanto, Arroz, Lenteja |
| `TUB` | **Tubérculos** | Papa Capira, Yuca, Plátano Hartón |
| `VER` | **Verduras** | Tomate Chonto, Cebolla, Zanahoria |

### 3.3 Algoritmo de "Ahorro"
El sistema destaca productos basándose en el **Delta de Ahorro**.

$$
\text{Ahorro \%} = \left( \frac{\text{Promedio 90 días} - \text{Precio Actual}}{\text{Promedio 90 días}} \right) \times 100
$$

**Reglas de UI basadas en el dato:**
* **Flag "De Temporada 🌟":** Si Ahorro > **15%**.
* **Flag "Precio Justo ✅":** Si Ahorro > **5%** y < **15%**.

---

## 4. Especificaciones de Diseño (Frontend - Sabor de Plaza)

### 4.1 Design System

* **Color Primario:** `Emerald-600` (`#059669`) → Fondos, bordes de cards, líneas de gráficos.
* **Color Acento/CTA:** `Orange-500` (`#F97316`) → Botones principales, badges de descuento alto.
* **Tipografía:** *Inter* o *Montserrat* (Sans-serif, clean, modern).
* **Vibe:** Fresco, Orgánico, Mercado Local, Data-driven.

### 4.2 Arquitectura de Componentes

#### A. Componente `LandingHero` (View: 'LANDING')
* **Layout:** Full viewport height (`h-screen`).
* **Contenido:**
    * Título H1 grande: *"La Economía de la Plaza en tu Bolsillo"*.
    * Subtítulo: *"Monitoreamos la Mayorista, Minorista y Placita de Flórez para decirte qué comprar hoy en Medellín."*
    * **Botón CTA:** "Comenzar Ahorro" (Naranja vibrante).
* **Acción:** Al click, ejecuta `setView('DASHBOARD')` con transición suave.

#### B. Componente `Dashboard` (View: 'DASHBOARD')
Debe contener dos secciones principales:

**1. El Gráfico de Tendencia (Top Section)**
* **Librería:** Chart.js (Line Chart).
* **Datos:** Simular la variación de precios de los últimos 7 días para el "Producto Estrella" (el de mayor ahorro).
* **Estilo:** Línea `Emerald-600`, relleno degradado bajo la línea, puntos visibles en los valores.

**2. Grid de Oportunidades (Main Section)**
* **Layout:** Grid responsive (1 col móvil, 2 cols tablet, 4 cols desktop).
* **Cards:** Cada tarjeta representa uno de los "16 Elegidos" (Top 4 por categoría).
* **Contenido de la Card:**
    * Nombre del Producto (ej. "Papa Capira").
    * Plaza de Origen (ej. "Mayorista").
    * Precio Actual (con formato moneda COP).
    * **Badge de Estado:** (Ver reglas en sección 3.3).
    * **Icono:** Usar `lucide-react` dinámico (ej. `Leaf`, `Carrot`, `Apple`).

---

## 5. Estructura de Datos (JSON Contract)

Para que el frontend funcione, genera un mock data hook (`useCosechaData`) que retorne este array de objetos:

```typescript
interface ProductAlert {
  id: string;
  name: string;      // ej: "Aguacate Hass"
  category: 'FRU' | 'GRN' | 'TUB' | 'VER';
  market: string;    // ej: "Plaza Minorista"
  currentPrice: number;
  averagePrice90d: number;
  savingsPercentage: number; // Calculado previamente
  history7d: number[]; // Array de 7 precios para el gráfico Chart.js
}

6. Instrucciones para Desarrollo (AI Prompt)
Inicialización: Scaffolding de proyecto con Vite + React + Tailwind.

Data Layer: Crea un hook useMockData que genere datos aleatorios realistas basados en la Sección 5.

Importante: Asegúrate de que al menos un producto tenga un ahorro > 20% para destacar en el gráfico inicial.

State Management: Implementa navegación de estado simple (useState para cambiar entre Landing y Dashboard).

Componentes: Desarrolla componentes funcionales modulares (Card, Chart, Hero).

Responsividad: Asegúrate de que el gráfico de Chart.js se adapte a pantallas móviles.
