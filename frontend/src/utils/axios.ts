import axios, { AxiosResponse, AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  detail?: string;
}

const API_BASE_URL = 'http://localhost:8000';

// Custom error type that includes response
class ApiError extends Error {
  response?: AxiosResponse<ApiErrorResponse>;
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Get CSRF token from cookie
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Add request interceptor
instance.interceptors.request.use(
  async (config) => {
    // Log request details
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Log error response in detail
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });

    // Create custom error with response data
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.detail || 
                        error.message || 
                        'An error occurred';
    const apiError = new ApiError(errorMessage);
    apiError.response = error.response;
    return Promise.reject(apiError);
  }
);

export default instance;