import React, { useEffect, useState } from 'react';

const BrandHeader = () => {
    const [wpSiteName, setWpSiteName] = useState('');

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
            <span className="brand">
                <strong>Obatala</strong>
                <small>{wpSiteName && ` | ${wpSiteName}`}</small>
                <span>Curatorial Process Management</span>
            </span>
        </header>
    );
};

export default BrandHeader;