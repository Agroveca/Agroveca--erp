# API: Descubrimiento de Productos Shopify No Mapeados en ERP

Esta función expone un endpoint GET para listar productos (y variantes) de Shopify que aún no están vinculados (mapeados) en el ERP, junto con sugerencias automáticas de match según el SKU/product_id.

**Ruta:**
```
/supabase/functions/shopify-discovery
```

---

## Ejemplo de request

```http
GET /supabase/functions/shopify-discovery
```

No requiere parámetros; autenticación y control de acceso pueden añadirse según se necesite.

---

## Ejemplo de respuesta

```json
{
  "unmapped": [
    {
      "shopifyProduct": {
        "id": "gid://shopify/Product/1001",
        "title": "Fertilizante Universal 1L",
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/2001",
            "title": "1L",
            "sku": "FERT-001-1L"
          }
        ]
      },
      "variant": {
        "id": "gid://shopify/ProductVariant/2001",
        "sku": "FERT-001-1L"
      },
      "suggestedMatch": null // O un objeto Product si hay match sugerido
    },
    // ...otros productos/variantes sin mapear
  ]
}
```

Si hay coincidencia entre la SKU del producto en Shopify y el product_id del ERP, `suggestedMatch` contendrá el objeto Product correspondiente desde el ERP.

---

## Uso y siguientes pasos
- El endpoint puede ser consumido para poblar el nuevo panel de salud de integración, dar alertas al usuario, o guiar el proceso de mapeo automático.
- Cuando se integre la API real de Shopify, sólo debe reemplazarse el stub `fetchShopifyProductsStub` sin alterar el contrato de respuesta.

---

**TODO:**
- Añadir autenticación/jwt para producción.
- Enriquecer la lógica de sugerencia de matches considerando otros campos (nombre, formato).
- Extender el modelo Product en el ERP para soportar references shopify_product_id/shopify_variant_id.
