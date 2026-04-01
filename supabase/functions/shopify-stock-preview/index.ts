import { createClient } from "npm:@supabase/supabase-js@2";

let shopifyAccessToken: string | undefined;
let shopifyTokenExpiresAt = 0;

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

async function getShopifyAccessToken(): Promise<string> {
  const shop = getRequiredEnv("SHOPIFY_SHOP");
  const clientId = getRequiredEnv("SHOPIFY_CLIENT_ID");
  const clientSecret = getRequiredEnv("SHOPIFY_CLIENT_SECRET");

  if (shopifyAccessToken && Date.now() < shopifyTokenExpiresAt - 60000) {
    return shopifyAccessToken;
  }

  const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain Shopify token (${response.status})`);
  }

  const { access_token, expires_in } = await response.json();
  shopifyAccessToken = access_token;
  shopifyTokenExpiresAt = Date.now() + (Number(expires_in) || 86400) * 1000;
  return access_token;
}

function normalizeShopDomain(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "").trim().toLowerCase();
}

function getConfiguredShopDomain(configShopDomain?: string | null): string {
  const envShop = getRequiredEnv("SHOPIFY_SHOP");
  const envShopDomain = `${envShop}.myshopify.com`.toLowerCase();

  if (!configShopDomain) {
    return envShopDomain;
  }

  const normalizedConfigDomain = normalizeShopDomain(configShopDomain);

  if (normalizedConfigDomain !== envShopDomain) {
    throw new Error(`Shopify shop mismatch between config (${normalizedConfigDomain}) and server secret (${envShopDomain})`);
  }

  return normalizedConfigDomain;
}

function normalizeLocationId(value: string): string {
  return value.includes("/") ? (value.split("/").pop() || "") : value;
}

function normalizeVariantGid(value: string): string {
  return value.startsWith("gid://shopify/ProductVariant/")
    ? value
    : `gid://shopify/ProductVariant/${value}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PreviewRequest {
  product_ids: string[];
}

interface PreviewProduct {
  id: string;
  name: string;
  product_id: string;
  shopify_variant_id: string | null;
}

interface PreviewStockItem {
  product_id: string;
  shopify_quantity: number | null;
  error: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: authResult, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authResult.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, is_active")
      .eq("user_id", authResult.user.id)
      .maybeSingle();

    const normalizedRole = profile?.role?.toLowerCase();
    if (!profile?.is_active || (normalizedRole !== "admin" && normalizedRole !== "operario")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: config, error: configError } = await supabase
      .from("shopify_config")
      .select("shop_domain, api_version, shopify_location_id")
      .eq("is_active", true)
      .maybeSingle();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: "Shopify not configured or not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { product_ids }: PreviewRequest = await req.json();

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return new Response(JSON.stringify({ error: "product_ids is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, product_id, shopify_variant_id")
      .in("id", product_ids);

    if (productsError) {
      return new Response(JSON.stringify({ error: productsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedProducts = (products || []) as PreviewProduct[];
    const productsById = new Map<string, PreviewProduct>(typedProducts.map((product) => [product.id, product]));
    const shopDomain = getConfiguredShopDomain(config.shop_domain);
    const accessToken = await getShopifyAccessToken();
    const locationId = config.shopify_location_id
      ? normalizeLocationId(config.shopify_location_id)
      : await getShopifyLocationId(shopDomain, config.api_version, accessToken);

    if (!locationId) {
      return new Response(JSON.stringify({ error: "Could not resolve Shopify location ID" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items: PreviewStockItem[] = [];

    for (const productId of product_ids) {
      const product = productsById.get(productId);

      if (!product) {
        items.push({ product_id: productId, shopify_quantity: null, error: "Producto no encontrado en ERP" });
        continue;
      }

      if (!product.shopify_variant_id) {
        items.push({ product_id: productId, shopify_quantity: null, error: "Producto sin shopify_variant_id" });
        continue;
      }

      const inventoryItemResult = await getInventoryItemId(
        shopDomain,
        config.api_version,
        accessToken,
        product.shopify_variant_id,
      );

      if (!inventoryItemResult.inventoryItemId) {
        items.push({
          product_id: productId,
          shopify_quantity: null,
          error: inventoryItemResult.error || "No se pudo resolver inventory item en Shopify",
        });
        continue;
      }

      const inventoryLevelResult = await getCurrentInventoryLevel(
        shopDomain,
        config.api_version,
        accessToken,
        inventoryItemResult.inventoryItemId,
        locationId,
      );

      items.push({
        product_id: productId,
        shopify_quantity: inventoryLevelResult.available,
        error: inventoryLevelResult.error || null,
      });
    }

    return new Response(JSON.stringify({ items, location_id: locationId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getShopifyLocationId(
  shopDomain: string,
  apiVersion: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const url = `https://${shopDomain}/admin/api/${apiVersion}/locations.json`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });

    const data = await response.json();
    return data.locations?.[0]?.id ? String(data.locations[0].id) : null;
  } catch (error) {
    console.error("Error getting location ID:", error);
    return null;
  }
}

async function getInventoryItemId(
  shopDomain: string,
  apiVersion: string,
  accessToken: string,
  variantId: string,
): Promise<{ inventoryItemId: string | null; error?: string }> {
  try {
    const url = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;
    const normalizedVariantId = normalizeVariantGid(variantId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `
          query ProductVariantInventoryItem($id: ID!) {
            productVariant(id: $id) {
              inventoryItem {
                legacyResourceId
              }
            }
          }
        `,
        variables: { id: normalizedVariantId },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        inventoryItemId: null,
        error: `Shopify productVariant query failed (${response.status})`,
      };
    }

    if (data.errors?.length) {
      return {
        inventoryItemId: null,
        error: `Shopify GraphQL errors: ${JSON.stringify(data.errors)}`,
      };
    }

    const legacyResourceId = data.data?.productVariant?.inventoryItem?.legacyResourceId;

    if (!legacyResourceId) {
      return {
        inventoryItemId: null,
        error: `Shopify variant ${normalizedVariantId} has no inventory item or was not found.`,
      };
    }

    return { inventoryItemId: String(legacyResourceId) };
  } catch (error) {
    return {
      inventoryItemId: null,
      error: error instanceof Error ? error.message : "Unknown inventory item lookup error",
    };
  }
}

async function getCurrentInventoryLevel(
  shopDomain: string,
  apiVersion: string,
  accessToken: string,
  inventoryItemId: string,
  locationId: string,
): Promise<{ available: number | null; error?: string }> {
  try {
    const url = `https://${shopDomain}/admin/api/${apiVersion}/inventory_levels.json?inventory_item_ids=${inventoryItemId}&location_ids=${locationId}`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        available: null,
        error: `Shopify inventory_levels failed (${response.status})`,
      };
    }

    const level = data.inventory_levels?.[0];

    if (!level) {
      return {
        available: null,
        error: "La variante no tiene inventory level en la location configurada de Shopify.",
      };
    }

    return {
      available: typeof level.available === "number" ? level.available : null,
    };
  } catch (error) {
    return {
      available: null,
      error: error instanceof Error ? error.message : "Unknown inventory level lookup error",
    };
  }
}
