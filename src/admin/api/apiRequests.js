import apiFetch from '@wordpress/api-fetch';

export const fetchProcessTypes = async () => {
    const data = await apiFetch({ path: `/obatala/v1/process_type?per_page=100&_embed` });
    return data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
};

export const fetchProcessSteps = async () => {
    const data = await apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` });
    return data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
};

export const saveProcessType = async (id, processType) => {
    const path = id ? `/obatala/v1/process_type/${id}` : `/obatala/v1/process_type`;
    const method = id ? 'PUT' : 'POST';
    const data = await apiFetch({ path, method, data: processType });
    return data;
};

export const deleteProcessType = async (id) => {
    await apiFetch({ path: `/obatala/v1/process_type/${id}`, method: 'DELETE' });
};

export const updateProcessStep = async (id, processStep) => {
    const data = await apiFetch({ path: `/obatala/v1/process_step/${id}`, method: 'PUT', data: processStep });
    return data;
};

export const checkLinkedProcesses = async (typeId) => {
    const allProcesses = await apiFetch({ path: `/obatala/v1/process_obatala?per_page=100` });
    return allProcesses.some(process => Number(process.process_type) === typeId);
};
