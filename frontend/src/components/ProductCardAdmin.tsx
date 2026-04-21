import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { useNavigate } from 'react-router-dom';

interface ProductCardAdminProps {
  product: Product;
  category: Category | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductCardAdmin({ product, category, onEdit, onDelete }: ProductCardAdminProps) {
  const navigate=useNavigate();
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        position: 'relative',
        transition: 'transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Action buttons */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
      }}>
        <button
          onClick={e => { e.stopPropagation(); onEdit(product.id); }}
          style={btnStyle}
        >
          ✏️
        </button>

        <button
          onClick={e => { e.stopPropagation(); onDelete(product.id); }}
          style={btnStyle}
        >
          🗑️
        </button>
      </div>

      {/* Image */}
      <img
        src={product.images[0] || 'https://placehold.co/400x400?text=No+Image'}
        alt={product.title}
        style={{ width: '100%', height: '220px', objectFit: 'cover' }}
      />

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{
          fontSize: '11px',
          color: '#aaa',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          {category?.name}
        </p>

        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '6px'
        }}>
          {product.title}
        </h3>

        <p style={{
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '4px'
        }}>
          ₹{product.price.toLocaleString()}
        </p>

        <p style={{
          fontSize: '12px',
          color: product.stock > 0 ? '#16a34a' : '#dc2626'
        }}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
};