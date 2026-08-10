import React, { useState } from 'react';
import { DropdownMenu, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BrandHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header>
            <button id="toggleMenu" onClick={() => setMenuOpen(!menuOpen)}><Icon icon="menu" /> {__('Menu', 'obatala')}</button>
            <nav id="mainNav" className={menuOpen ? 'active' : ''}>
                <a href={obatalaApp.admin_url + "admin.php?page=obatala-main"}  className="menu-brand">
                    <h1>
                        <strong>{__('Tainacan Gestão', 'obatala')}</strong>
                    </h1>
                </a>
                <a href={obatalaApp.admin_url + "admin.php?page=obatala-main"} className="menu-link"><Icon icon="admin-home" /> {__('Dashboard', 'obatala')}</a>
                <a href={obatalaApp.admin_url +"admin.php?page=process-manager"} className="menu-link"><Icon icon="admin-page" /> {__('Processes', 'obatala')}</a>
                <a href={obatalaApp.admin_url +"admin.php?page=process-type-manager"} className="menu-link"><Icon icon="welcome-widgets-menus" /> {__('Models', 'obatala')}</a>
                <a href={obatalaApp.admin_url +"admin.php?page=collection-items"} className="menu-link"><Icon icon="archive" /> {__('Collection items', 'obatala')}</a>
                <a href={obatalaApp.admin_url +"admin.php?page=tainacan_admin#/home"} className="menu-tainacan menu-link ms-auto">Tainacan</a>
                <DropdownMenu
                    icon="admin-generic"
                    label={__('Settings', 'obatala')}
                    controls={ [
                        {
                            title: __('Groups', 'obatala'),
                            onClick: () => window.location.href = obatalaApp.admin_url +'admin.php?page=sector_manager',
                        },
                        {
                            title: __('Users', 'obatala'),
                            onClick: () => window.location.href = obatalaApp.admin_url +'users.php',
                        },
                    ] }
                />   
                <a href={obatalaApp.admin_url}  className="menu-link menu-icon" title="WordPress"><Icon icon="wordpress-alt" /><span className="text">{__('WordPress', 'obatala')}</span></a>
            </nav>
        </header>
    );
};

export default BrandHeader;
