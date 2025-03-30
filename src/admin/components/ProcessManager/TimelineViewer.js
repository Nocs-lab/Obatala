import React, { useState, useEffect } from 'react';
import { Notice, Spinner } from '@wordpress/components';
import { fetchProcessById } from '../../api/apiRequests';
import Timeline from './ProcessUserLog';

const TimelineViewer = ({ processId }) => {
    const [process, setProcess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProcessById(processId)
            .then(data => {
                setProcess(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load process timeline');
                setLoading(false);
            });
    }, [processId]);

    if (loading) return <Spinner />;
    if (error) return <Notice status="error" isDismissible={false}>{error}</Notice>;
    if (!process) return <Notice status="warning" isDismissible={false}>No process found</Notice>;

    return (
        <div style={{ padding: '20px' }}>
            <Timeline 
                process={process}
            />
        </div>
    );
};

export default TimelineViewer;