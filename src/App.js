import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import CategoryList from './pages/CategoryList';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <ProductList />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/products/new" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <ProductForm />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/products/edit/:id" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <ProductForm />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <CategoryList />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
