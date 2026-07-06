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

  return (
    <>
      {/* Canonical главной (index.html глобального canonical не имеет —
          товарные страницы ставят свой через ProductPage) */}
      <Head>
        <link rel="canonical" href="https://goryasno.ru/" />
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
