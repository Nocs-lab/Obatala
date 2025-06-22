import React, { useEffect, useState } from 'react';
import { DropdownMenu, Icon } from '@wordpress/components';

const BrandHeader = () => {
    const [wpSiteName, setWpSiteName] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/wp-json')
            .then(response => response.json())
            .then(data => {
                if (data.name) {
                    setWpSiteName(data.name);
                }
            });
    }, []);

    return (
        <header>
            <button id="toggleMenu" onClick={() => setMenuOpen(!menuOpen)}><Icon icon="menu" /> Menu</button>
            <nav id="mainNav" className={menuOpen ? 'active' : ''}>
                <a href="/wp-admin/admin.php?page=obatala-main" className="menu-brand">
                    <h1>
                        <strong>Obatala</strong>
                        <small>{wpSiteName && `${wpSiteName}`}</small>
                    </h1>
                </a>
                <a href="/wp-admin/admin.php?page=obatala-main" className="menu-link"><Icon icon="admin-home" /> Dashboard</a>
                <a href="/wp-admin/admin.php?page=process-manager" className="menu-link"><Icon icon="admin-page" /> Processes</a>
                <a href="/wp-admin/admin.php?page=process-type-manager" className="menu-link"><Icon icon="welcome-widgets-menus" /> Models</a>

                <a href="/wp-admin/admin.php?page=tainacan_admin#/home" className="menu-tainacan menu-link ms-auto">Tainacan</a>
                <DropdownMenu
                    icon="admin-generic"
                    label="Settings"
                    controls={ [
                        {
                            title: 'Groups',
                            onClick: () => window.location.href = '/wp-admin/admin.php?page=sector_manager',
                        },
                        {
                            title: 'Users',
                            onClick: () => window.location.href = '/wp-admin/users.php',
                        },
                    ] }
                />   
                <a href={obatalaApp.admin_url}  className="menu-link menu-icon" title="Wordpress"><Icon icon="wordpress-alt" /><span className="text">Wordpress</span></a>
            </nav>
        </header>
    );
};

export default BrandHeader;