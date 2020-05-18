module.exports = {
  title: 'IOMesh',
  tagline: '',
  organizationName: 'iomesh', // Usually your GitHub org/user name.
  projectName: 'iomesh-docs', // Usually your repo name.
  url: 'https://iomesh.github.io',
  baseUrl: '/iomesh-docs/',
  favicon: '/img/favicon.ico',
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      title: 'IOMesh',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: '/docs/example',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/iomesh',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Example',
              to: '/docs/example',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'IOMesh',
              href: 'https://github.com/iomesh',
            }
          ],
        },
        {
          title: 'More'
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} IOMesh`
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
