/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useOutletContext } from "react-router-dom";
import { Head } from "vite-react-ssg";

import type { LayoutContext } from "../App";

import Hero from "../components/Hero";
import Catalog from "../components/Catalog";
import HowWeWork from "../components/HowWeWork";
import FeedbackSection from "../components/FeedbackSection";

export default function Home() {
  const { theme, onSelectProduct, onSubmitSuccess } = useOutletContext<LayoutContext>();

  const title = "Купить уголь, дрова, песок и щебень в Донецке со склада | ГориЯсно";
  const description = "Антрацит, уголь Т и ДГ, дрова, песок и щебень со склада в Донецке. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР в день звонка. Тел: +7 (949) 340-10-11.";
  const ogDescription = "Антрацит, уголь Т и ДГ, дрова, песок, щебень, вывоз мусора в Донецке. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР. Тел: +7 (949) 340-10-11, МТС: +7 (988) 994-68-96.";
  const ogImage = "https://goryasno.ru/images/products/anthracite-bags.jpg";

  return (
    <>
      {/* Title/description/OG источника SSG (index.html больше не содержит статичных тегов head) */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://goryasno.ru/" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content="https://goryasno.ru/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      {/* Hero promo block with Warehouse Status & Live Stock */}
      <div className="transition-all">
        <Hero theme={theme} />
      </div>

      {/* Catalog tab section */}
      <div className="transition-all">
        <Catalog onSelectProduct={onSelectProduct} theme={theme} />
      </div>

      {/* Steps explanations section */}
      <div className="transition-all">
        <HowWeWork theme={theme} />
      </div>

      {/* Main bottom feedback with interactive map */}
      <div className="transition-all">
        <FeedbackSection onSubmitSuccess={onSubmitSuccess} theme={theme} />
      </div>
    </>
  );
}
