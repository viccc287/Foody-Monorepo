interface AppConfig {
  validPin: string;
  apiUrl: string;
}

export const getConfig = (): AppConfig => ({
  validPin: import.meta.env.VITE_VALID_PIN || "1234",
  apiUrl:
    import.meta.env.VITE_API_URL || 'http://"import.meta.env.VITE_SERVER_URL+"',
});
