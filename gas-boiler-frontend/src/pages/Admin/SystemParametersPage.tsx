import React from 'react';
import Navbar from '../../components/Navbar';

const SystemParametersPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Sistemski parametri</h2>
        <p>Ovde će admin moći da menja konstante kao što su cena gasa i temperatura tla.</p>
      </div>
    </>
  );
};

export default SystemParametersPage;
