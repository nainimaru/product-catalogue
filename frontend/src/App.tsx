import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddEditProductPage from './pages/AddEditProductPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products/new" element={<AddEditProductPage />} />
        <Route path="/admin/products/:id" element={<AddEditProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}