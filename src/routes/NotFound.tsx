/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Head } from "vite-react-ssg";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Страница не найдена — ГориЯсно</title>
        <meta name="robots" content="noindex" />
      </Head>
      <section className="py-32 text-center">
        <h1 className="text-4xl font-extrabold font-display text-white">Страница не найдена</h1>
        <p className="text-slate-400 mt-4 font-sans">
          Такой страницы нет. Перейдите в{" "}
          <Link to="/" className="text-amber-500 hover:text-white underline">
            каталог товаров
          </Link>
          .
        </p>
      </section>
    </>
  );
}
