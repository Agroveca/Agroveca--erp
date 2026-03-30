# Validación de Integración ERP – Shopify para Cuida Tu Planta

## Resumen ejecutivo: ¿Qué escenarios existen?

### Escenario 1: "Seguro y manual" (Actual)
- El ERP es el maestro del inventario, vinculación de productos es manual.
- Sincronización sólo de stock, pedidos Shopify entran automáticamente al ERP.
- Ideal para catálogo pequeño y cambios poco frecuentes.

**Pro:** Control sólido, bajo riesgo de errores automáticos.

**Contra:** El mapeo manual puede volverse costoso en operaciones y promover errores si el catálogo crece o hay muchas campañas.

---

### Escenario 2: "Automatizado y con alertas"
- Sincronización ERP → Shopify, pero el sistema detecta productos nuevos y ayuda a mapearlos automáticamente, avisando si hay pendientes.
- Panel para ver salud de integración, alertas de token, pendientes de sincronizar.

**Pro:** Reduce errores humanos, mejora operación diaria y soporte ante incidencias.

**Contra:** Requiere desarrollo, puede ser excesivo si el catálogo no crece y los procesos actuales no presentan dolores.

---

### Escenario 3: "Escalable y bidireccional"
- El ERP y Shopify intercambian datos más allá de stock: productos nuevos, actualizaciones de catálogo, devoluciones y estados de pedido se sincronizan automáticamente.
- Concebido para gran volumen, más delegación y crecimiento acelerado.

**Pro:** Lista para expansión, menos trabajo manual, mejor experiencia para clientes B2C y operadores.

**Contra:** Mucho más complejo técnica y funcionalmente, requiere redefinir procesos internos.

---

## 1. Contexto del Negocio

Cuida Tu Planta es una tienda digital enfocada en el consumidor final de productos y servicios para el cuidado de plantas urbanas. Opera sobre la plataforma Shopify, maneja un catálogo acotado de productos (fertilizantes, bioestimulantes, packs, soluciones orgánicas), campañas estacionales y promociones frecuentes, con ventas y despachos a nivel nacional.

El ERP implementado busca ser el cerebro operativo y maestro del inventario, ventas, clientes y registros internos. El objetivo de la integración es unificar la gestión de stock entre sistemas y facilitar la captura de pedidos, alineando la operación física y digital.

## 2. Estado Actual de la Integración

### ¿Qué permite la integración hoy?
- **Sincronización de stock ERP → Shopify**: El ERP es la única fuente válida de inventario. Solo los productos que han sido vinculados manualmente (por ID de producto y variante Shopify) se sincronizan.
- **Recepción de pedidos Shopify**: Los pedidos hechos en la tienda Shopify llegan automáticamente al ERP, creando/completando el registro del cliente y contabilizando comisión/costos asociados.
- **Logs, control y visibilidad básica**: El ERP permite monitorear sincronizaciones, pedidos recibidos y cambios relevantes de forma centralizada. Solo administradores pueden operar la integración.

### ¿Cómo se realiza el trabajo?
- Se vinculan los productos del ERP a Shopify agregando manualmente los IDs necesarios en el ERP.
- El usuario dispara la sincronización de inventario desde el ERP.
- El ERP recibe pedidos nuevos de Shopify y los registra en el sistema central.
- No hay sincronización automática de catálogo, devoluciones ni estados avanzados de pedido.


## 3. Pros y Contras Frente a la Realidad de CTP

### Principales Ventajas
- **Control sólido de stock**: Evita quiebres y ventas fuera de inventario; el ERP es el "único dueño" del stock.
- **Recepción automática de ventas**: Los pedidos de Shopify entran directo al flujo ERP, evitando errores manuales de captura.
- **Fácil de mantener para catálogo reducido**: Si no cambian muchos productos ni promociones, el modelo manual de vinculación es suficiente y seguro.
- **Auditoría y trazabilidad**: Hay logs de errores/success para identificar problemas.

### Riesgos y Limitaciones
- **Vinculación manual puede escalar mal**: Si el catálogo aumenta o se modifican varios productos/packs, existe mayor riesgo de errores y de "olvidar" mapear productos nuevos/actualizados.
- **Desacople en promociones/campañas**: Promos/packs de corta duración necesitan vinculación y mapeo cada vez (puede ser operativo o ineficiente si el volumen crece).
- **No hay validación proactiva del access token ni diagnosis**: Si caduca/falla el access token o hay errores de configuración, sólo se detectan al fallar una sincronización, sin alerta previa.
- **No sincroniza catálogo ni actualizaciones ricas**: Agregar, actualizar precios, descripciones o eliminar productos sigue siendo manual y propenso a errores.
- **No cubre devoluciones ni cambios de estado**: Todo lo que no sea venta o inventario queda por fuera del automatismo.

## 4. Mejoras Propuestas (a Validar con el Negocio)

**Si la operación se mantiene acotada y con poco cambio de catálogo:**
- Seguir con el flujo actual puede ser suficiente siempre que el responsable administre con disciplina la vinculación manual y valide periódicamente los productos mapeados.

**Si se proyecta crecimiento de productos o campañas frecuentes, o se desea menos carga manual:**
- Automatizar la importación/mapeo de productos Shopify en el ERP, o generar sugerencias/inteligencia de "match".
- Implementar un panel de salud de integración: muestra estado de acceso, últimos logs, pendientes de vincular y alertas de configuración.
- Mejorar alertas proactivas de token, productos desmapeados y sincronizaciones fallidas (antes que afecten operación).
- Integrar flujos de catálogo bidireccional, devoluciones y actualización de info de producto si el negocio lo requiere en el futuro.

## 5. Preguntas y Validaciones al Negocio
- ¿Con qué frecuencia agregan/modifican productos, variantes o packs en Shopify? ¿Planean ampliar el catálogo?
- ¿Quién es el responsable directo de mantener actualizada la vinculación de productos?
- ¿Se presentan errores de sincronización con la frecuencia de las campañas/promos actuales?
- ¿Prefieren mantener el flujo manual (actual) o desean automatizar más la integración?
- ¿Tienen expectativas de que el ERP gestione devoluciones, cambios de estado de pedido u otros detalles de postventa?

## 6. Siguiente Paso Clave

Antes de avanzar con mejoras o cambios técnicos, es esencial alinear con el negocio cuál es el flujo deseado y esperado a futuro y validar la cobertura actual frente a la realidad operativa de Cuida Tu Planta.

> *Este documento busca apoyar la toma de decisiones, no dirigir el desarrollo sin validación previa del equipo de negocio y operación.*
