/** @type {import('next').NextConfig} */
const nextConfig = {

  //just include this while rendering the PDF on Ui (If there is any issue)

  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",

      },
      {
        protocol: "https",
        hostname: "img.clerk.com"
      }
    ],
  },
};

export default nextConfig;
