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

import {useAuth0} from '../Auth';
import headphones from '../images/logo.png';

export const Nav = () => {
  const [collapsed, setCollapsed] = useState(true);
  const {isAuthenticated, loginWithRedirect, logout} = useAuth0();

  const toggleNavbar = () => setCollapsed(!collapsed);

  return (
    <div>
      <Navbar color="faded" dark className="bg-dark px-4" expand="md">
        <NavbarBrand href="/" className="mr-auto">
          <img src={headphones} alt="logo" height="25px" />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse isOpen={!collapsed} navbar>
          <BsNav navbar className="d-flex ml-auto">
            <NavItem>
              <div>
                {!isAuthenticated && (
                  <NavLink
                    style={{cursor: 'pointer'}}
                    onClick={() => loginWithRedirect({})}
                  >
                    Log in
                  </NavLink>
                )}

                {isAuthenticated && (
                  <NavLink style={{cursor: 'pointer'}} onClick={() => logout()}>
                    Log out
                  </NavLink>
                )}
              </div>
            </NavItem>
          </BsNav>
        </Collapse>
      </Navbar>
    </div>
  );
};
