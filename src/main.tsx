import {StrictMode} from 'react';
import {ViteReactSSG} from 'vite-react-ssg';
import type {RouteRecord} from 'vite-react-ssg';
import App from './App.tsx';
import Home from './routes/Home.tsx';
import ProductPage from './routes/ProductPage.tsx';
import NotFound from './routes/NotFound.tsx';
import {PRODUCTS} from './data.ts';
import './index.css';

// Уникальные слаги товарных страниц для пререндера.
const productPaths = [...new Set(PRODUCTS.map(p => p.slug).filter((s): s is string => Boolean(s)))].map(
  s => `/${s}`,
);

function Root() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Root,
    entry: 'src/App.tsx',
    children: [
      {index: true, Component: Home, entry: 'src/routes/Home.tsx'},
      {
        path: ':slug',
        Component: ProductPage,
        entry: 'src/routes/ProductPage.tsx',
        // Какие пути пререндерить для динамического роута.
        getStaticPaths: () => productPaths,
      },
      {path: '*', Component: NotFound, entry: 'src/routes/NotFound.tsx'},
    ],
  },
];

// Пререндер роутов в статический HTML на этапе сборки (vite-react-ssg),
// в браузере — обычная гидрация того же дерева.
export const createRoot = ViteReactSSG({routes});

// Модуль исполняется и в Node при SSG-сборке — регистрируем SW только в браузере.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register relative to the configured base path so the SW works whether
    // the app is served from "/" or a subpath like "/goriasno/".
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
