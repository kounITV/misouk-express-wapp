import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow builds to succeed even if there are ESLint issues.
    // We still run lint in CI/editor, but don't block local builds.
    ignoreDuringBuilds: true,
  },
    typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
      { protocol: 'http', hostname: 'www.w3.org' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  //   webpack: (config, options) => {
  //   config.resolve.fallback = { fs: false, path: false, os: false };
  //   config.experiments = { ...config.experiments, topLevelAwait: true };
  //   config.module.rules.push({
  //     test: /\.(ts)x?$/,
  //     use: [
  //       {
  //         loader: 'ts-loader',
  //         options: {
  //           transpileOnly: true,
  //           experimentalWatchApi: true,
  //           onlyCompileBundledFiles: true,
  //         },
  //       },
  //     ],
  //   });
  //   return config;
  // },
};

export default nextConfig;
