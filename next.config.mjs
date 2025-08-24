/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.web.squarecdn.com https://web.squarecdn.com https://js.squarecdn.com https://pci-connect.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com;",
              "connect-src 'self' https://pci-connect.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com;",
              "frame-src https://pci-connect.squarecdn.com;",
            ].join(' ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
