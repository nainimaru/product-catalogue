import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { getCategories } from '../api/categories';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import ProductCard from '../components/ProductCard';

const PRODUCTS_PER_PAGE = 6;
type Gender = 'men' | 'women' | 'kids';

export default function ProductListPage() {
  const navigate = useNavigate();

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useFetch(() => getProduct());

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch(() => getCategories());

  const categories: Category[] = categoriesData || [];
  const products: Product[] = productsData?.data || [];

  const [gender, setGender] = useState<Gender>('men');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  const genderCatIds = useMemo(
    () => categories.filter(c => c.gender === gender).map(c => c.id),
    [categories, gender]
  );
  const visibleCategories = useMemo(() => {
    return categories.filter(c => c.gender === gender);
  }, [categories, gender]);

  const filtered = useMemo(() => {
    let result = products.filter(p => genderCatIds.includes(p.categoryId));

    // 🔹 Category filter
    if (selectedCategory !== 'all') {
        result = result.filter(p => p.categoryId === selectedCategory);
    }

    // 🔹 Search filter
    if (search.trim()) {
        result = result.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    // 🔹 Sorting
    if (sortOrder === 'asc') {
        result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
        result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, genderCatIds, search, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);

  const paginated = filtered.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    setPage(1);
    setSelectedCategory('all');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid #111',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}>
        <span
          style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '4px', color: '#fff', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          CATALOGUE
        </span>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            width: '240px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #333',
            fontSize: '13px',
            outline: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
          }}
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
            }}
          >
            {g}
          </button>
        ))}
      </div>

        {/* Category Filter */}
    <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 32px',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap'
    }}>
    <span style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>
        FILTER
    </span>

    {/* All button */}
    <button
        onClick={() => setSelectedCategory('all')}
        style={{
        padding: '6px 14px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: selectedCategory === 'all' ? '#000' : '#f5f5f5',
        color: selectedCategory === 'all' ? '#fff' : '#333',
        cursor: 'pointer',
        fontSize: '13px'
        }}
    >
        All
    </button>

    {/* Dynamic categories */}
    {visibleCategories.map(cat => (
        <button
        key={cat.id}
        onClick={() => setSelectedCategory(cat.id)}
        style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: selectedCategory === cat.id ? '#000' : '#f5f5f5',
            color: selectedCategory === cat.id ? '#fff' : '#333',
            cursor: 'pointer',
            fontSize: '13px'
        }}
        >
        {cat.name}
        </button>
    ))}
    </div>

    {/* Sort */}
    <div style={{
    padding: '12px 32px',
    display: 'flex',
    justifyContent: 'flex-end'
    }}>
    <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as any)}
        style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '13px'
        }}
    >
        <option value="">Sort by</option>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
    </select>
    </div>

      {/* Results count */}
      <div style={{ padding: '12px 32px', fontSize: '13px', color: '#888' }}>
        {loading ? 'Loading...' : `${filtered.length} products found`}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: '0 32px 16px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Product Grid */}
      <div style={{ padding: '0 32px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#aaa' }}>
            <p style={{ fontSize: '16px' }}>Loading products...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <p style={{ fontSize: '18px' }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {paginated.map(product => {
              const category = categories.find(c => c.id === product.categoryId);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={category?.name}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          borderTop: '1px solid #e5e5e5',
        }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid #000',
              backgroundColor: page === 1 ? '#f5f5f5' : '#000',
              color: page === 1 ? '#aaa' : '#fff',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            Previous
          </button>

          <span style={{ fontSize: '13px', color: '#888' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid #000',
              backgroundColor: page === totalPages ? '#f5f5f5' : '#000',
              color: page === totalPages ? '#aaa' : '#fff',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}