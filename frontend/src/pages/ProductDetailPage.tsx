import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import type { Product } from '../types/product';
import { useState, useEffect } from 'react';

export default function ProductDetailPage() {
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, loading, error } = useFetch<Product>(() =>
    getProductById(id!)
  );
  const [selectedImage, setSelectedImage] = useState<string>('');
  useEffect(() => {
    if (product) {
        setSelectedImage(product.images[0]);
    }
  }, [product]);
  
  if (loading) {
    return <div style={{ padding: '40px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px' }}>{error}</div>;
  }

  if (!product) {
    return <div style={{ padding: '40px' }}>Product not found</div>;
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>

      {/* Navbar */}
      <div
        onClick={() => navigate('/')}
        style={{
          padding: '16px 32px',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#fff',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        CATALOGUE
      </div>

      {/* MAIN */}
      <div style={{
        display: 'flex',
        gap: '48px',
        padding: '40px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'flex-start'
      }}>
        
        {/* LEFT: IMAGES */}
        <div style={{
        flex: 1,
        minWidth: '320px',
        maxWidth: '500px'
        }}>

        {/* MAIN IMAGE */}
        <div style={{
            width: '100%',
            marginBottom: '16px'
        }}>
            <img
            src={selectedImage}
            alt="main"
            style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid #e5e5e5'
            }}
            />
        </div>

        {/* THUMBNAILS */}
        <div style={{
            display: 'flex',
            gap: '12px'
        }}>
            {product.images.map((img, index) => (
            <img
                key={index}
                src={img}
                alt="thumb"
                onClick={() => setSelectedImage(img)}
                style={{
                width: '70px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedImage === img
                    ? '2px solid #000'
                    : '1px solid #ddd'
                }}
            />
            ))}
        </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div style={{
          flex: 1,
          maxWidth: '420px'
        }}>

          {/* BRAND */}
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {product.brand}
          </h2>

          {/* TITLE */}
          <p style={{
            fontSize: '15px',
            color: '#555',
            marginBottom: '12px'
          }}>
            {product.title}
          </p>

          <hr style={{ margin: '16px 0' }} />

          {/* PRICE */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{
              fontSize: '22px',
              fontWeight: '700'
            }}>
              ₹{product.price}
            </span>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#16a34a',
            marginBottom: '20px'
          }}>
            inclusive of all taxes
          </p>

          {/* TAGS */}
            {product.tags.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
                {product.tags.map((tag, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                    
                    <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px'
                    }}>
                    {tag.key.toUpperCase()}
                    </h3>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {tag.value.split(',').map((val, i) => (
                        <span
                        key={i}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '20px',
                            fontSize: '12px'
                        }}
                        >
                        {val}
                        </span>
                    ))}
                    </div>

                </div>
                ))}
            </div>
            )}

          {/* STOCK */}
          <p style={{
            fontSize: '14px',
            color: product.stock > 0 ? '#16a34a' : '#dc2626',
            marginBottom: '24px'
          }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <hr style={{ margin: '24px 0' }} />

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Description
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#555',
              lineHeight: '1.6'
            }}>
              {product.description}
            </p>
          </div>

          <hr style={{ margin: '24px 0' }} />

          {/* ✅ SPECIFICATIONS (RIGHT SIDE FIXED) */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Specifications
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px 32px'
            }}>
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  style={{
                    paddingBottom: '10px',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <p style={{
                    fontSize: '12px',
                    color: '#777',
                    marginBottom: '4px'
                  }}>
                    {spec.key}
                  </p>

                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111'
                  }}>
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}