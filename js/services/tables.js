/* =========================================================
   Servicio de mesas (web)
   Todas las llamadas relacionadas con mesas.
   ========================================================= */
const TableApi = {
    /* Obtener una mesa por id
       GET /api/tables/{id}  →  { data: {...} } */
    getById(id) {
        return ApiClient.get(`/tables/${id}`);
    },

    /* Actualizar los datos de una mesa
       PUT /api/tables/{id}  →  { data: {...} } */
    update(id, data) {
        return ApiClient.put(`/tables/${id}`, data);
    },

    /* Eliminar una mesa
       DELETE /api/tables/{id}  →  204 No Content */
    delete(id) {
        return ApiClient.del(`/tables/${id}`);
    },

    /* Rotar el estado de una mesa (sin body)
       PATCH /api/tables/{id}/status  →  { data: {...} } */
    rotateStatus(id) {
        return ApiClient.patch(`/tables/${id}/status`);
    },

    /* Listar todos los estados disponibles
       GET /api/table-statuses  →  { data: [...] } */
    listStatuses() {
        return ApiClient.get('/table-statuses');
    }
};