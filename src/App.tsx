import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import Home from './pages/Home.tsx';
import VerificationForm from './components/verification/VerificationForm.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verification/verify" element={<VerificationForm />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
