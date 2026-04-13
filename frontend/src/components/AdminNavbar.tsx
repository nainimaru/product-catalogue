export default function Navbar() {
  return (
    <nav style={{
      width: '100%',
      padding: '16px 32px',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    }}>
      <span style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '1px' }}>
        ADMIN CONTROL
      </span>
    </nav>
  );
}