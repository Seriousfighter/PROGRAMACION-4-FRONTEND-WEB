/* =========================================================
   Servicio de restaurantes (web)
   Todas las llamadas relacionadas con restaurantes.
   ========================================================= */
const RestaurantApi = {
    /* Listar los restaurantes del usuario autenticado
       GET /api/restaurants  →  { data: [...] } */
    list() {
        return ApiClient.get('/restaurants');
    },

    /* Obtener un restaurante por id
       GET /api/restaurants/{id}  →  { data: {...} } */
    getById(id) {
        return ApiClient.get(`/restaurants/${id}`);
    },

    /* Crear un restaurante
       POST /api/restaurants  →  { data: {...} } */
    create(data) {
        return ApiClient.post('/restaurants', data);
    },

    /* Actualizar un restaurante
       PUT /api/restaurants/{id}  →  { data: {...} } */
    update(id, data) {
        return ApiClient.put(`/restaurants/${id}`, data);
    },

    /* Eliminar un restaurante
       DELETE /api/restaurants/{id}  →  204 No Content */
    delete(id) {
        return ApiClient.del(`/restaurants/${id}`);
    },

    /* Listar mesas de un restaurante
       GET /api/restaurants/{id}/tables  →  { data: [...] } */
    listTables(id) {
        return ApiClient.get(`/restaurants/${id}/tables`);
    },

    /* Crear una mesa en un restaurante
       POST /api/restaurants/{id}/tables  →  { data: {...} } */
    createTable(id, data) {
        return ApiClient.post(`/restaurants/${id}/tables`, data);
    }
};