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
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
