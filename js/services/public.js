/* =========================================================
   Servicio público
   Endpoints que NO requieren autenticación.
   ========================================================= */
const PublicApi = {
    /* Lista de restaurantes ordenados por cantidad de mesas disponibles
       GET /api/public/restaurants  →  { data: [...] } */
    listRestaurants() {
        return ApiClient.get('/public/restaurants', false);
    },

    /* Detalle de un restaurante
       GET /api/public/restaurants/{id}  →  { data: {...} } */
    getRestaurant(id) {
        return ApiClient.get(`/public/restaurants/${id}`, false);
    }
};