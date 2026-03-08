import { useStoreBase } from "@/store/store";
import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

<<<<<<< HEAD
const baseURL = import.meta.env.VITE_API_BASE_URL ;
console.log('Base URL:', baseURL);
=======
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.basaltsolutions.org/api";
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
<<<<<<< HEAD
  console.log('Base URL: ', baseURL);
=======
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
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
<<<<<<< HEAD
//testing the time out 1000 
=======
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
