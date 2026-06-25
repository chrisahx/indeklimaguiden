import { SITE } from './constants';

export interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}

export function titleWithBrand(title: string) {
  return title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
}
