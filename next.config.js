import withModernizr from "next-plugin-modernizr";
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
  experimental: {
    outputFileTracingIgnores: ["**canvas**"],
  },
  reactStrictMode: false,
};

export default withModernizr(nextConfig);
