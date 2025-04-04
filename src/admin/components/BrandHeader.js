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
                <strong>
                    Obatala
                    {wpSiteName && ` | ${wpSiteName}`}
                </strong>
                Curatorial Process Management
            </span>
        </header>
    );
};

export default BrandHeader;