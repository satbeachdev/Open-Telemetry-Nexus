interface Config {
  apiBaseUrl: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: Config;
  private initialized: Promise<void>;

  private constructor() {
    // Default configuration
    this.config = {
      apiBaseUrl: 'http://localhost:8000'
    };
    // Initialize the config loading
    this.initialized = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private async loadConfig() {
    try {
      const response = await fetch('/manta-config.json');
      if (!response.ok) {
        throw new Error('Failed to load configuration file');
      }
      this.config = await response.json();
    } catch (error) {
      console.warn('Failed to load manta-config.json, using default configuration:', error);
    }
  }

  async getConfig(): Promise<Config> {
    await this.initialized;
    return this.config;
  }

  async setConfig(newConfig: Partial<Config>): Promise<void> {
    await this.initialized;
    this.config = { ...this.config, ...newConfig };
  }

  // Method to manually reload configuration from file
  async reloadConfig(): Promise<void> {
    this.initialized = this.loadConfig();
    await this.initialized;
  }
}

export default ConfigService; 