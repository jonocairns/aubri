import React, {useState} from 'react';
import {
  Collapse,
  Nav as BsNav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from 'reactstrap';

import headphones from './images/headphones.png';

export const Nav = () => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);

  return (
    <div>
      <Navbar color="faded" dark className="bg-dark px-4" expand="md">
        <NavbarBrand href="/" className="mr-auto">
          <img src={headphones} alt="logo" width="40px" />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse isOpen={!collapsed} navbar>
          <BsNav navbar className="d-flex ml-auto">
            <NavItem>
              <NavLink href="/components/">Users</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://github.com/jonocairns/audi">
                GitHub
              </NavLink>
            </NavItem>
          </BsNav>
        </Collapse>
      </Navbar>
    </div>
  );
};
