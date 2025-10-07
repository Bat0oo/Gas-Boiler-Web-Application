import React from 'react';
import Navbar from '../../components/Navbar';

const UsersPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Pregled korisnika</h2>
        <p>Ovde će admin moći da vidi sve korisnike i da ih blokira ili obriše.</p>
      </div>
    </>
  );
};

export default UsersPage;
