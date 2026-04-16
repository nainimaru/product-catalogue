import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, createProduct, updateProduct } from '../api/products';
import { getCategories } from '../api/categories';
import type { Category } from '../types/category';
import type { KeyValue } from '../types/product';

interface FormState {
  title: string;
  description: string;
  brand: string;
  price: string;
  stock: string;
  categoryName: string;
  categoryGender: 'men' | 'women' | 'kids';
  images: string;
  specifications: KeyValue[];
  tags: KeyValue[];
}

export default function AddEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    brand: '',
    price: '',
    stock: '',
    categoryName: '',
    categoryGender: 'men',
    images: '',
    specifications: [{ key: '', value: '' }],
    tags: [{ key: '', value: '' }],
  });

  // Load categories + product if editing
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEdit && id) {
          const product = await getProductById(id);
          setForm({
            title: product.title,
            description: product.description,
            brand: product.brand,
            price: product.price.toString(),
            stock: product.stock.toString(),
            categoryName: '',
            categoryGender: 'men',
            images: product.images.join(', '),
            specifications: product.specifications.length > 0 ? product.specifications : [{ key: '', value: '' }],
            tags: product.tags.length > 0 ? product.tags : [{ key: '', value: '' }],
          });
        }
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Specification handlers
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...form.specifications];
    updated[index] = { ...updated[index], [field]: value };
    setForm(prev => ({ ...prev, specifications: updated }));
  };

  const addSpec = () => {
    setForm(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  };

  const removeSpec = (index: number) => {
    setForm(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  };

  // Tag handlers
  const handleTagChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...form.tags];
    updated[index] = { ...updated[index], [field]: value };
    setForm(prev => ({ ...prev, tags: updated }));
  };

  const addTag = () => {
    setForm(prev => ({ ...prev, tags: [...prev.tags, { key: '', value: '' }] }));
  };

  const removeTag = (index: number) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.stock) {
      setError('Title, price and stock are required.');
      return;
    }
    if (!form.categoryName) {
        setError('Category is required.');
        return;
    }

    setSubmitting(true);
    setError('');

    try {

      const payload = {
        title: form.title,
        description: form.description,
        brand: form.brand,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: {
          name: form.categoryName,
          gender: form.categoryGender,
        },
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        specifications: form.specifications.filter(s => s.key && s.value),
        tags: form.tags.filter(t => t.key && t.value),
      };

      if (isEdit && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      navigate('/admin');
    } catch {
      setError('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid #e5e5e5',
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
        <span style={{ fontSize: '12px', letterSpacing: '2px', color: '#888' }}>ADMIN PANEL</span>
        <button
          onClick={() => navigate('/admin')}
          style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #333', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 32px' }}>

        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '32px', letterSpacing: '1px' }}>
          {isEdit ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
        </h2>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', color: '#000' }}>BASIC INFO</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={labelStyle}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. White Oversized Tee" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. H&M" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Price (₹) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 1299" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stock *</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="e.g. 50" style={inputStyle} />
              </div>
            </div>

          </div>
        </div>

        {/* Category */}
        <div style={sectionStyle}>
        <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px' }}>
            CATEGORY
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
            <label style={labelStyle}>Category Name *</label>
            <input
                name="categoryName"
                value={form.categoryName}
                onChange={handleChange}
                placeholder="e.g. T-Shirts, Shoes, Accessories"
                style={inputStyle}
            />
            </div>

            <div>
            <label style={labelStyle}>Gender *</label>
            <select
                name="categoryGender"
                value={form.categoryGender}
                onChange={handleChange}
                style={inputStyle}
            >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
            </select>
            </div>

        </div>
        </div>

        {/* Images */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', color: '#000' }}>IMAGES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Image URLs (comma separated)</label>
              <input name="images" value={form.images} onChange={handleChange} placeholder="https://..., https://..." style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', color: '#000' }}>SPECIFICATIONS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {form.specifications.map((spec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
                <input
                  value={spec.key}
                  onChange={e => handleSpecChange(i, 'key', e.target.value)}
                  placeholder="Key (e.g. Material)"
                  style={inputStyle}
                />
                <input
                  value={spec.value}
                  onChange={e => handleSpecChange(i, 'value', e.target.value)}
                  placeholder="Value (e.g. Cotton)"
                  style={inputStyle}
                />
                <button
                  onClick={() => removeSpec(i)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addSpec}
              style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer', color: '#555' }}
            >
              + Add Specification
            </button>
          </div>
        </div>

        {/* Tags */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', color: '#000' }}>TAGS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {form.tags.map((tag, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
                <input
                  value={tag.key}
                  onChange={e => handleTagChange(i, 'key', e.target.value)}
                  placeholder="Key (e.g. Color)"
                  style={inputStyle}
                />
                <input
                  value={tag.value}
                  onChange={e => handleTagChange(i, 'value', e.target.value)}
                  placeholder="Value (e.g. White)"
                  style={inputStyle}
                />
                <button
                  onClick={() => removeTag(i)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addTag}
              style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer', color: '#555' }}
            >
              + Add Tag
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: submitting ? '#888' : '#000',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            letterSpacing: '2px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            marginBottom: '40px',
          }}
        >
          {submitting ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'ADD PRODUCT'}
        </button>
      </div>
    </div>
  );
}