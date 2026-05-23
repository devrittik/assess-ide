import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

export async function loadProject(id) {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    console.warn('[projectApi.load]', err.message);
    return null;
  }
}

export async function saveProject(id, files, name) {
  try {
    const { data } = await api.post(`/projects/${id}`, { files, name });
    return data;
  } catch (err) {
    console.warn('[projectApi.save]', err.message);
    return null;
  }
}

export async function deleteProject(id) {
  try {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  } catch (err) {
    console.warn('[projectApi.delete]', err.message);
    return null;
  }
}
