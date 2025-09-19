import type { NextConfig } from "next";

let outputMode: 'standalone' | 'export' = 'standalone'

if (process.env.OUTPUT_MODE === 'export') {
  outputMode = 'export'
}

const nextConfig: NextConfig = {
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators#appisrstatus-static-indicator
  devIndicators: false,
  // https://qiita.com/unreadabread/items/920420c24fc49cb3b392
  // Use Static Export when running next build.
  output: outputMode,
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
  // basePath: isProd ? '/external-arte-hall-koushoin' : '',
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix
  // assetPrefix: isProd ? '/external-arte-hall-koushoin/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
