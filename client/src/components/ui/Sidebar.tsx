import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const links = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/services', name: 'Services' },
        { path: '/contact', name: 'Contact' },
    ];

    return (
        <motion.div
            className="sidebar"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <h2>Navigation</h2>
            <nav>
                <ul>
                    {links.map(link => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                activeClassName="active"
                                className="nav-link"
                            >
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
};

export default Sidebar;