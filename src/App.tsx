import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VerificationForm from './components/VerificationForm';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/verification/verify" element={<VerificationForm />} />
      </Routes>
    </Router>
  );
};

export default App;
