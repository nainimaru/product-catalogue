import type { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        width: '100%',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <img
        src={product.imageUrl || 'https://placehold.co/400x400?text=No+Image'}
        alt={product.name}
        style={{ width: '100%', height: '260px', objectFit: 'cover' }}
      />
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>
          {product.categoryId}
        </p>
        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 8px' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>
            ₹{product.price.toLocaleString()}
          </span>
          <span style={{ fontSize: '13px', color: '#888' }}>
            ★ {product.rating.toFixed(1)}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: product.stock > 0 ? '#22c55e' : '#ef4444', margin: '6px 0 0' }}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  );
}