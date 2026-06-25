import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type CategoryKey } from './constants';

export type Article = CollectionEntry<'articles'>;

export const includeDrafts = !import.meta.env.PROD;

export function articleUrl(article: Article) {
  return `/${article.data.category}/${article.data.slug}/`;
}

export async function getArticles() {
  const articles = await getCollection('articles', ({ data }) => includeDrafts || !data.draft);

  return articles.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getArticlesByCategory(category: CategoryKey) {
  const articles = await getArticles();
  return articles.filter((article) => article.data.category === category);
}

export function getCategory(category: CategoryKey) {
  return CATEGORIES[category];
}

export function relatedArticles(current: Article, articles: Article[], limit = 3) {
  return articles
    .filter((article) => article.id !== current.id && article.data.category === current.data.category)
    .slice(0, limit);
}
