import { useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';


const PRODUCTS_PER_PAGE = 6;
type Gender = 'men' | 'women' | 'kids';

export default function ProductListPage() {
  const navigate = useNavigate();

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch(() => getCategories());

  const categories = useMemo(() => categoriesData || [], [categoriesData]);


  const [searchParams, setSearchParams] = useSearchParams();
  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    setSearchParams(params);
  };
  
  const page = Number(searchParams.get('page')) || 1;
  const gender = (searchParams.get('gender') as Gender) || 'men';
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sortOrder = (searchParams.get('order') as 'asc' | 'desc' | '') || '';

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } =useFetch(() =>getProduct({
      page,
      limit: PRODUCTS_PER_PAGE,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search,
      sortBy: 'price',
      order: sortOrder || undefined,
      gender,
    }),
    [page, selectedCategory, search, sortOrder, gender]
  );

  const products = productsData?.data || [];
  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;
  const visibleCategories = useMemo(() => {
    return categories.filter(c => c.gender === gender);
  }, [categories, gender]);

  const totalPages = Math.ceil((productsData?.total || 0) / PRODUCTS_PER_PAGE);

  const handleGenderChange = (g: Gender) => {
    updateParams({
      gender: g,
      category: 'all',
      page: '1',
    });
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
            updateParams({
              search: e.target.value,
              page: '1',
            });
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
        onClick={() => updateParams({
          category: 'all',
          page: '1',
        })}
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
        onClick={() => updateParams({
          category: cat.id,
          page: '1',
        })}
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
        onChange={(e) => updateParams({
          order: e.target.value,
          page: '1',
        })}
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
        {loading ? 'Loading...' : `${productsData?.total || 0} products found`}
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
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <p style={{ fontSize: '18px' }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {products.map(product => {
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
            onClick={() => updateParams({
              page: String(page - 1),
            })}
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
            onClick={() => updateParams({
              page: String(page + 1),
            })}
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