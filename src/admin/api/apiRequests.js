import apiFetch from "@wordpress/api-fetch";

export const fetchProcessModels = () => {
  return apiFetch({
    path: `/obatala/v1/process_type?per_page=100&_embed`,
  }).then((data) => {
    console.log("Fetched process types:", data); // Adiciona log para verificar os dados
    return data.map((item) => {
      return {
        ...item,
        description: item.meta.description ? String(item.meta.description) : "",
        step_order: item.meta.step_order,
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

export const saveProcessType = (processType, editingProcessType) => {
  const path = editingProcessType
    ? `/obatala/v1/process_type/${editingProcessType.id}`
    : `/obatala/v1/process_type`;
  const method = editingProcessType ? "PUT" : "POST";
  return apiFetch({ path, method, data: processType });
};

export const updateProcessTypeMeta = (id, meta) => {
  return apiFetch({
    path: `/obatala/v1/process_type/${id}/meta`,
    method: "PUT",
    data: meta,
  });
};
export const fetchProcessTypeById = (id) => {
  return apiFetch({path: `/obatala/v1/process_type/${id}`})
}
export const deleteProcessType = (id) => {
  return apiFetch({ path: `/obatala/v1/process_type/${id}`, method: "DELETE" });
};

export const fetchProcesses = () => {
  return apiFetch({ path: `/obatala/v1/process_obatala?per_page=100` });
};

export const fetchProcessById = (id) => {
  return apiFetch({path: `/obatala/v1/process_obatala/${id}`})
}

export const fetchSectors = () => {
    return apiFetch({ path: `/obatala/v1/all_sector_obatala` });   
}; 

export const fetchSectorsUsers = () => {
  return apiFetch({ path: `/obatala/v1/sector_obatala/sectors_with_users` });   
}; 

export const saveSector = async (sector, editingSector) => {
    const path = editingSector ? `/obatala/v1/update_sector_obatala/${editingSector.id}` : `/obatala/v1/create_sector_obatala`;
    const method = 'POST';
    return apiFetch({ path, method, data: sector });
};

export const deleteSector = (id) => {
    return apiFetch({ path: `/obatala/v1/delete_sector_obatala/${id}`, method: 'DELETE' });
};

export const fetchUsers = () => {
  return apiFetch({ path: `/obatala/v1/sector_obatala/users_obatala` });   
};

export const fetchUsersBySector = (id) => {
  return apiFetch({ path: `/obatala/v1/sector_obatala/${id}/users` });   
};

export const assignUserToSector = (data) => {
  const path = `/obatala/v1/associate_user_to_sector`;
  const method = 'POST';
  return apiFetch({ path: path, method, data: data });   
};

export const deleteSectorUser = (sectorId, data) => {
  return apiFetch({ path: `/obatala/v1/sector_obatala/${sectorId}/remove_user`, method: 'POST', data: data });
};

export const fetchNodePermission = (processId, currentUserId) => {
  return apiFetch({ path: `/obatala/v1/process_type/${processId}/get_node?user=${currentUserId}` })
}