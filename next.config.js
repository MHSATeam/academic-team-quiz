/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    if (!("ignoreWarnings" in config)) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push({
      message: /Critical dependency/,
      module: /keyv/,
    });
    return config;
  },
};

export default nextConfig;
