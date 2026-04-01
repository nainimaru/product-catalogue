import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../api/mockData';
import type { Product } from '../types/product';

const PRODUCTS_PER_PAGE = 6;

type Gender = 'men' | 'women' | 'kids';

export default function ProductListPage() {
  const navigate = useNavigate();
  const [gender, setGender] = useState<Gender>('men');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);

  const genderCategories = MOCK_CATEGORIES.filter(c => c.gender === gender);

  const filtered = useMemo(() => {
    let result: Product[] = MOCK_PRODUCTS;

    const genderCatIds = MOCK_CATEGORIES
      .filter(c => c.gender === gender)
      .map(c => c.id);
    result = result.filter(p => genderCatIds.includes(p.categoryId));

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    if (search.trim()) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    

    return result;
  }, [gender, selectedCategory, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    setSelectedCategory('all');
    setPage(1);
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <div style={{ padding: '16px 32px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '4px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          CATALOGUE
        </span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: '240px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
        />
      </div>

      {/* Gender tabs */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        {(['men', 'women', 'kids'] as Gender[]).map(g => (
          <button
            key={g}
            onClick={() => handleGenderChange(g)}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: 'none',
              borderBottom: gender === g ? '2px solid #000' : '2px solid transparent',
              backgroundColor: '#fff',
              color: gender === g ? '#000' : '#aaa',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1px', marginRight: '4px' }}>FILTER</span>

        <button
          onClick={() => handleCategoryChange('all')}
          style={{
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: selectedCategory === 'all' ? '#000' : '#e5e5e5',
            backgroundColor: selectedCategory === 'all' ? '#000' : '#fff',
            color: selectedCategory === 'all' ? '#fff' : '#555',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          All
        </button>

        {genderCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: selectedCategory === cat.id ? '#000' : '#e5e5e5',
              backgroundColor: selectedCategory === cat.id ? '#000' : '#fff',
              color: selectedCategory === cat.id ? '#fff' : '#555',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {cat.name}
          </button>
        ))}

        {/* Sort — pushed to right */}
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); setPage(1); }}
          style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' }}
        >
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ padding: '12px 32px', fontSize: '13px', color: '#888' }}>
        {filtered.length} products found
      </div>

      {/* Product Grid */}
      <div style={{ padding: '0 32px 32px' }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <p style={{ fontSize: '18px' }}>No products found</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {paginated.map(product => {
              const category = MOCK_CATEGORIES.find(c => c.id === product.categoryId);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <img
                    src={product.images[0] || 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.title}
                    style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {category?.name}
                    </p>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      {product.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>
                        ₹{product.price.toLocaleString()}
                      </span>
                      
                    </div>
                    <p style={{ fontSize: '12px', marginTop: '6px', color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px', borderTop: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #000', backgroundColor: page === 1 ? '#f5f5f5' : '#000', color: page === 1 ? '#aaa' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '13px', color: '#888' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #000', backgroundColor: page === totalPages ? '#f5f5f5' : '#000', color: page === totalPages ? '#aaa' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}