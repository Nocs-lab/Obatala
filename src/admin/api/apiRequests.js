import apiFetch from '@wordpress/api-fetch';

export const fetchProcessTypes = () => {
    return apiFetch({ path: `/obatala/v1/process_type?per_page=100&_embed` }).then(data => {
        console.log('Fetched process types:', data); // Adiciona log para verificar os dados
        return data.map(item => {
            return {
                ...item,
                description: item.meta.description ? String(item.meta.description) : '',
                step_order: item.meta.step_order
            };
        });
    });
};

// Função para desserializar
const maybeUnserialize = (data) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};




export const fetchProcessSteps = () => {
    return apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` });
};

export const saveProcessType = (processType, editingProcessType) => {
    const path = editingProcessType ? `/obatala/v1/process_type/${editingProcessType.id}` : `/obatala/v1/process_type`;
    const method = editingProcessType ? 'PUT' : 'POST';
    return apiFetch({ path, method, data: processType });
};

export const updateProcessTypeMeta = (id, meta) => {
    
    return apiFetch({
        path: `/obatala/v1/process_type/${id}/meta`,
        method: 'PUT',
        data: meta
    });
};

export const deleteProcessType = (id) => {
    return apiFetch({ path: `/obatala/v1/process_type/${id}`, method: 'DELETE' });
};

export const updateProcessStep = (id, processType) => {
    return apiFetch({
        path: `/obatala/v1/process_step/${id}`,
        method: 'PUT',
        data: { process_type: processType }
    });
};

export const fetchProcesses = () => {
    return apiFetch({ path: `/obatala/v1/process_obatala?per_page=100` });
};
