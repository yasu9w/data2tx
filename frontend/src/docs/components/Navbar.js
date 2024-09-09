// src/components/Navbar.js
import React from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

const NavbarContainer = styled.div`
  background-color: #1e1e1e;
  color: white;
  padding: 10px;
  padding-left: 280px;
  display: flex;
  align-items: center;
`;

const SearchBar = styled.input`
  margin-left: auto;
  padding: 5px;
  border-radius: 4px;
  border: none;
  outline: none;
`;

const Navbar = () => {
    return (
        <NavbarContainer>
            <h1>Solana Docs</h1>
            <SearchBar placeholder="Search..." />
            <FaSearch style={{ marginLeft: '10px' }} />
        </NavbarContainer>
    );
};

export default Navbar;
