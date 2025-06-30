import type { Configuration, RuleSetRule } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config: Configuration) {
    if (!config.module || !config.module.rules) return config;

    const fileLoaderRule = config.module.rules.find(
      (rule): rule is RuleSetRule => {
        if (typeof rule === 'object' && rule !== null && 'test' in rule) {
          return (
            rule.test instanceof RegExp &&
            (rule.test.test('.svg') || rule.test.test('.png'))
          );
        }
        return false;
      }
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
      console.log('Excluded .svg from default asset loader rule.');
    } else {
      console.warn('Could not find the default asset loader rule to exclude .svg. This might cause issues.');
    }

    config.module.rules.push(
      {
        test: /\.svg$/i,
        // Removed issuer: /\.[jt]sx?$/, to allow SVGR to process all non-?url SVG imports
        resourceQuery: { not: [/url/] }, // For importing as React Component
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource', // For importing as URL
        resourceQuery: /url/,
      }
    );

    return config;
  },
};

export default nextConfig;