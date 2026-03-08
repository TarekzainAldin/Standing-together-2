import { useStoreBase } from "@/store/store";
import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.basaltsolutions.org/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const accessToken = useStoreBase.getState().accessToken;
  if (accessToken) {
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error?.response?.data;
    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  }
);

export default API;
