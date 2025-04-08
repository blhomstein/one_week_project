import axios from "axios";

// this class intercept request while handing responses for 401, Token expiry, and refreshing expired tokens
class AxiosInterceptor {
  constructor(instanceConfig = {}) {
    this.isRefreshing = false; // tracks is there any refresh token process in the doing
    this.refreshSubscribers = []; // a queue for failed requests due to token expiry waiting for the token to refresh

    this.axiosInstance = axios.create({
      ...instanceConfig,
    });

    console.log("iu do also get logged ;)");

    // Add request interceptor that attaches access token to auth header in http request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = this.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    //  response interceptor that checks for token expiry or other relevant error returned as responses from express due to token expiry
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data.message === "TokenExpiredError" &&
          !originalRequest._retry
        ) {
          if (!this.isRefreshing) {
            // process of token refreshing

            this.isRefreshing = true;

            try {
              const newTokens = await this.refreshTokens();
              this.setAccessToken(newTokens.accessToken);
              this.setRefreshToken(newTokens.refreshToken);
              // call all failed requests due to token expiry from the queue
              this.refreshSubscribers.forEach((callback) =>
                callback(newTokens.accessToken)
              );
              this.refreshSubscribers = [];
              // calling again axios to retry for the original request

              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              this.refreshSubscribers = []; // Clear the queue in case of failure
              this.setAccessToken("");
              this.setRefreshToken("");

              if (
                window.location.pathname != "/auth/login" ||
                window.location.pathname != "/auth/register"
              ) {
                window.location.href = "/auth/login";
              }

              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          return new Promise((resolve) => {
            this.refreshSubscribers.push((newAccessToken) => {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              originalRequest._retry = true;
              resolve(this.axiosInstance(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );

    // Bind instance methods for convenience

    this.get = async () => {
      this.axiosInstance.get.bind(this.axiosInstance);
    };

    this.post = async () => {
      console.log("poat");

      this.axiosInstance.post.bind(this.axiosInstance);
    };
    this.put = async () => {
      this.axiosInstance.put.bind(this.axiosInstance);
    };

    this.delete = async () => {
      this.axiosInstance.delete.bind(this.axiosInstance);
    };
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  setAccessToken(token) {
    localStorage.setItem("accessToken", token);
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  setRefreshToken(token) {
    localStorage.setItem("refreshToken", token);
  }

  async refreshTokens() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await this.axiosInstance.post("/auth/refreshToken", {
      refreshToken,
    });
    return response.data; // Expecting { accessToken: string, refreshToken: string }
  }
}

// Export a pre-configured instance of AxiosInterceptor
export const client = new AxiosInterceptor({
  baseURL: "http://localhost:8080/",
});
