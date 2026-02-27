import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data);

export default apiClient;
