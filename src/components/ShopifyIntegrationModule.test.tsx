import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ShopifyIntegrationModule from './ShopifyIntegrationModule';

// Helpers to mock fetch and user auth context
global.fetch = jest.fn();
jest.mock('../contexts/useAuth', () => ({ useAuth: () => ({ isAdmin: true }) }));

const mockUnmappedResponse = {
  unmapped: [
    {
      shopifyProduct: {
        id: 'gid://shopify/Product/1001',
        title: 'Producto A',
        variants: [{ id: 'gid://shopify/ProductVariant/2001', title: 'Rojo', sku: 'A-ROJO' }],
      },
      variant: { id: 'gid://shopify/ProductVariant/2001', sku: 'A-ROJO', title: 'Rojo' },
      suggestedMatch: {
        product_id: 'A-ROJO',
        name: 'Producto A ERP',
      },
    },
    {
      shopifyProduct: {
        id: 'gid://shopify/Product/1002',
        title: 'Producto B',
        variants: [{ id: 'gid://shopify/ProductVariant/2002', title: 'Azul', sku: 'B-AZUL' }],
      },
      variant: { id: 'gid://shopify/ProductVariant/2002', sku: 'B-AZUL', title: 'Azul' },
      suggestedMatch: null,
    },
  ],
};

describe('ShopifyIntegrationModule – Panel de Salud Shopify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra loader mientras carga los productos Shopify no mapeados', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {})); // nunca resuelve
    render(<ShopifyIntegrationModule />);
    expect(screen.getByText(/Cargando productos desde Shopify/i)).toBeInTheDocument();
  });

  it('muestra mensaje de error si falla el fetch', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('falló!'));
    render(<ShopifyIntegrationModule />);
    await waitFor(() => expect(screen.getByText(/Error: falló!/i)).toBeInTheDocument());
  });

  it('muestra tabla con productos y variantes no mapeados', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUnmappedResponse,
    });
    render(<ShopifyIntegrationModule />);
    await waitFor(() => {
      expect(screen.getByText(/Productos\/variantes de Shopify sin vincular/i)).toBeInTheDocument();
      expect(screen.getByText('Producto A')).toBeInTheDocument();
      expect(screen.getByText('Rojo')).toBeInTheDocument();
      expect(screen.getByText('A-ROJO')).toBeInTheDocument();
      expect(screen.getByText('Producto A ERP')).toBeInTheDocument();
      expect(screen.getByText('Producto B')).toBeInTheDocument();
      expect(screen.getByText('Azul')).toBeInTheDocument();
      expect(screen.getByText('B-AZUL')).toBeInTheDocument();
      expect(screen.getByText('Sin sugerencia')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de todo mapeado correctamente si el array está vacío', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unmapped: [] }),
    });
    render(<ShopifyIntegrationModule />);
    await waitFor(() => {
      expect(screen.getByText(/¡Todo mapeado correctamente!/i)).toBeInTheDocument();
    });
  });
});
