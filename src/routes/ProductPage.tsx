/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { Flame, ArrowRight, Grid, Scale, Layers } from "lucide-react";

import { PRODUCTS } from "../data";
import { reachGoal } from "../metrika";
import type { Product } from "../types";
import type { LayoutContext } from "../App";
import NotFound from "./NotFound";

const SITE_ORIGIN = "https://goryasno.ru";

// «от 9 000» → 9000; «договорная» → null
function parsePrice(priceEstimate: string): number | null {
  const digits = priceEstimate.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function buildProductJsonLd(product: Product) {
  const price = parsePrice(product.priceEstimate);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`${SITE_ORIGIN}${product.image}`],
    description: product.longDescription ?? product.description,
    brand: { "@type": "Brand", name: "ГориЯсно" },
    ...(price !== null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "RUB",
        price,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          referenceUnit: product.unit,
        },
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "ГориЯсно" },
      },
    }),
  };
}

function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { theme, onSelectProduct } = useOutletContext<LayoutContext>();

  // Один слаг может объединять несколько SKU (мешки/тонны).
  const skus = PRODUCTS.filter(p => p.slug === slug);

  useEffect(() => {
    if (skus.length > 0) {
      reachGoal("product_view", { product: slug });
    }
  }, [slug, skus.length]);

  if (skus.length === 0) return <NotFound />;

  // Primary — SKU с контентом страницы (longDescription).
  const primary = skus.find(p => p.longDescription) ?? skus[0];
  const pageUrl = `${SITE_ORIGIN}/${slug}`;
  const title = `${primary.name} в Донецке — купить со склада | ГориЯсно`;
  const metaDescription = `${primary.description.slice(0, 140)}… Доставка по ДНР. Тел: +7 (949) 340-10-11.`;

  const accentText =
    theme === "cool-slate" ? "text-sky-400" : theme === "cozy-wood" ? "text-amber-500" : "text-orange-500";
  const buttonClass =
    theme === "cool-slate"
      ? "bg-[#1d1d23] hover:bg-sky-500 hover:text-slate-950 text-white border-slate-800"
      : theme === "cozy-wood"
        ? "bg-[#1d1d23] hover:bg-amber-500 hover:text-slate-950 text-white border-slate-800"
        : "bg-[#1e1e24] hover:bg-orange-500 hover:text-slate-950 text-white border-slate-800";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_ORIGIN}${primary.image}`} />
        {skus.map(sku => (
          <script key={sku.id} type="application/ld+json">
            {JSON.stringify(buildProductJsonLd(sku))}
          </script>
        ))}
        {primary.faqs && primary.faqs.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(buildFaqJsonLd(primary.faqs))}</script>
        )}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Каталог", item: `${SITE_ORIGIN}/` },
            { "@type": "ListItem", position: 2, name: primary.name, item: pageUrl },
          ],
        })}</script>
      </Head>

      <section className="py-16 bg-[#0f0f12] border-t border-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">

          {/* Breadcrumb back link */}
          <Link to="/" className={`text-xs font-bold uppercase tracking-widest font-sans ${accentText} hover:text-white`}>
            ← Каталог товаров
          </Link>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-4">
            {primary.name} в Донецке
          </h1>

          {/* Photo + price */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl overflow-hidden border border-slate-900/80">
              <picture className="block w-full">
                <source type="image/webp" srcSet={primary.image.replace(/\.jpg$/, ".webp")} />
                <img
                  src={primary.image}
                  alt={primary.name}
                  width={960}
                  height={720}
                  decoding="async"
                  className="w-full object-cover"
                />
              </picture>
            </div>

            <div className="space-y-4">
              {/* Ценовой блок по SKU */}
              {skus.map(sku => (
                <div key={sku.id} className="bg-[#15151a] border border-slate-900/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white font-display">{sku.name}</div>
                    {sku.badge && (
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-sans mt-0.5">{sku.badge}</div>
                    )}
                  </div>
                  <div className={`text-lg font-black font-display whitespace-nowrap ${accentText}`}>
                    {sku.priceEstimate} ₽<span className="text-[11px] text-slate-400 font-normal">/{sku.unit}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => onSelectProduct(primary)}
                className={`w-full py-3.5 border rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer font-display ${buttonClass}`}
              >
                <span>Заказать</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Спецификации (как в карточке каталога) */}
              <div className="bg-[#0c0c0f] p-4 rounded-xl space-y-2 border border-slate-900 text-xs text-slate-400 font-sans">
                {primary.ashValue && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Scale className={`w-3.5 h-3.5 ${accentText}`} /> Зольность:</span>
                    <strong className="text-slate-300">{primary.ashValue}</strong>
                  </div>
                )}
                {primary.heatValue && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Flame className={`w-3.5 h-3.5 ${accentText}`} /> Теплота:</span>
                    <strong className="text-slate-300">{primary.heatValue}</strong>
                  </div>
                )}
                {primary.fraction && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Grid className={`w-3.5 h-3.5 ${accentText}`} /> Фракция угля:</span>
                    <strong className="text-slate-300">{primary.fraction}</strong>
                  </div>
                )}
                {primary.humidity && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Layers className={`w-3.5 h-3.5 ${accentText}`} /> Влажность:</span>
                    <strong className="text-slate-300">{primary.humidity}</strong>
                  </div>
                )}
                {primary.length && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Layers className={`w-3.5 h-3.5 ${accentText}`} /> Длина поленьев:</span>
                    <strong className="text-slate-300">{primary.length}</strong>
                  </div>
                )}
                {primary.materialType && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Layers className={`w-3.5 h-3.5 ${accentText}`} /> Назначение:</span>
                    <strong className="text-slate-300">{primary.materialType}</strong>
                  </div>
                )}
                {primary.deliveryMin && (
                  <div className="flex justify-between font-bold border-t border-slate-900/50 pt-1.5 mt-1">
                    <span>Мин. заказ:</span>
                    <span className={accentText}>{primary.deliveryMin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Long description */}
          <div className="mt-10 text-slate-400 text-sm sm:text-base leading-relaxed font-sans space-y-4">
            {(primary.longDescription ?? primary.description).split("\n").map(par => (
              <p key={par.slice(0, 40)}>{par}</p>
            ))}
          </div>

          {/* FAQ */}
          {primary.faqs && primary.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">Частые вопросы</h2>
              <div className="mt-4 space-y-4">
                {primary.faqs.map(faq => (
                  <div key={faq.q} className="bg-[#15151a] border border-slate-900/80 rounded-2xl p-5">
                    <h3 className="font-bold text-sm text-white font-display">{faq.q}</h3>
                    <p className="text-slate-400 text-sm mt-2 font-sans leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Похожие товары */}
          {(() => {
            const seenSlugs = new Set<string>();
            const related = PRODUCTS.filter(p => {
              if (!p.slug) return false;
              if (p.slug === slug || seenSlugs.has(p.slug)) return false;
              seenSlugs.add(p.slug);
              return true;
            }).slice(0, 3);
            if (related.length === 0) return null;
            return (
              <div className="mt-12">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">Похожие товары</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(product => (
                    <Link
                      key={product.id}
                      to={`/${product.slug!}`}
                      className="group bg-[#15151a] border border-slate-900/80 rounded-2xl p-4 hover:border-slate-700 transition-all"
                    >
                      <div className="rounded-xl overflow-hidden mb-3">
                        <picture className="block w-full">
                          <source type="image/webp" srcSet={product.image.replace(/\.jpg$/, ".webp")} />
                          <img
                            src={product.image}
                            alt={product.name}
                            width={320}
                            height={240}
                            decoding="async"
                            className="w-full h-32 object-cover"
                          />
                        </picture>
                      </div>
                      <h3 className="font-bold text-sm text-white font-display group-hover:text-orange-400 transition-colors">{product.name}</h3>
                      <div className={`text-sm font-black font-display mt-1 ${accentText}`}>{product.priceEstimate} ₽<span className="text-[10px] text-slate-400 font-normal">/{product.unit}</span></div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </section>
    </>
  );
}
