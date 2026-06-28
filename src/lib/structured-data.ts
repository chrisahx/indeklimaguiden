import type { Article } from './articles';
import { articleUrl } from './articles';
import { CATEGORIES, SITE } from './constants';
import { absoluteUrl } from './seo';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    email: SITE.contactEmail,
    logo: absoluteUrl('/logo.svg'),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'da-DK',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/soeg/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbsJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function articleJsonLd(article: Article) {
  const category = CATEGORIES[article.data.category];
  return {
    '@context': 'https://schema.org',
    '@type': article.data.schemaType ?? 'Article',
    headline: article.data.title,
    description: article.data.seoDescription ?? article.data.description,
    datePublished: article.data.pubDate.toISOString(),
    dateModified: (article.data.updatedDate ?? article.data.pubDate).toISOString(),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: absoluteUrl(articleUrl(article)),
    articleSection: category.name,
    inLanguage: 'da-DK',
  };
}

export function faqJsonLd(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
