
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 22586, hash: '998bc2fdab5fd76cd37fa1ed5d10a7b4fa31b8c17125e4776ac533886195c49f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 990, hash: '2178454e70f0f6bb1cc79c84c4695026d95c9fa657cd5a793dcacb203a79398d', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 81101, hash: '43e358a14b747f60cdf3cd156760e91a8699ca03daad44ff2be4c6f406419137', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-47CMSWE4.css': {size: 70178, hash: 'Btpw5HNu/t0', text: () => import('./assets-chunks/styles-47CMSWE4_css.mjs').then(m => m.default)}
  },
};
