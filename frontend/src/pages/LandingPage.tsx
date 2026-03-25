import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '4px', marginBottom: '30px' }}>
        CATALOGUE
      </h1>
      {/* <p style={{ color: '#888', marginBottom: '48px', fontSize: '14px' }}>
        Fashion. Redefined.
      </p> */}

      <div style={{ display: 'flex', gap: '24px' }}>
        <div
          onClick={() => navigate('/products')}
          style={{
            width: '200px',
            height: '240px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🛍️</span>
          <span style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '2px' }}>SHOP</span>
          <span style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>Browse products</span>
        </div>

        <div
          onClick={() => navigate('/admin')}
          style={{
            width: '200px',
            height: '240px',
            backgroundColor: '#fff',
            color: '#000',
            border: '2px solid #000',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>⚙️</span>
          <span style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '2px' }}>ADMIN</span>
          <span style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Manage products</span>
        </div>
      </div>
    </div>
  );
}