import api from "./api";

// Inventory API helpers use the same deploy-safe Axios instance.
export const getInventory = () => api.get("/inventory");
export const addInventory = (data) => api.post("/inventory", data);
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);
