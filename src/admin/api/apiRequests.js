import apiFetch from '@wordpress/api-fetch';

export const fetchProcessTypes = () => {
    return apiFetch({ path: `/obatala/v1/process_type?per_page=100&_embed` }).then(data => {

        return data.map(item => {
            return {
                ...item,
                accept_attachments: item.meta.accept_attachments[0] === "1",
                accept_tainacan_items: item.meta.accept_tainacan_items[0] === "1",
                generate_tainacan_items: item.meta.generate_tainacan_items[0] === "1",
                description: item.meta.description ? String(item.meta.description[0]) : '',
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
