const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const originalFetch = window.fetch;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

window.fetch = async (...args) => {
  const [resource, config] = args;
  
  let response = await originalFetch(resource, config);

  // If unauthorized, not already retrying, and not the refresh route itself
  if (response.status === 401 && !config?._retry && typeof resource === 'string' && !resource.includes('/auth/refresh')) {
    
    if (isRefreshing) {
      // If another request is currently refreshing the token, wait for it
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        const newConfig = { ...config, _retry: true };
        newConfig.headers = {
          ...newConfig.headers,
          Authorization: `Bearer ${token}`
        };
        return originalFetch(resource, newConfig);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    const newConfig = { ...config, _retry: true };
    isRefreshing = true;

    try {
      // Attempt to refresh
      const refreshRes = await originalFetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccessToken = data.accessToken;
        
        // Let AuthContext know about the new token to update React state
        window.dispatchEvent(
          new CustomEvent('token_refreshed', { detail: { accessToken: newAccessToken, user: data.user } })
        );

        processQueue(null, newAccessToken);

        // Retry the original request
        newConfig.headers = {
          ...newConfig.headers,
          Authorization: `Bearer ${newAccessToken}`
        };
        
        return originalFetch(resource, newConfig);
      } else {
        throw new Error("Refresh failed");
      }
    } catch (err) {
      processQueue(err, null);
      window.dispatchEvent(new Event('logout_required'));
      return response; // Return the original 401 response
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};
