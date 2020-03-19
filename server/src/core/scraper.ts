import cheerio from 'cheerio';

import {Audiobook} from './schema';
import {
  ratingsStringToNumber,
  runtimeStringToNumber,
  starsStringToNumber,
  stringToUtc,
} from './scraperUtils';

export const scraper = async (
  id: string,
  searchHtml: string,
  folder: string,
  description: string,
  link: string
): Promise<Audiobook> => {
  const searchPage = cheerio.load(searchHtml);
  const firstItem = searchPage('.productListItem')[0];
  const root = searchPage(firstItem);

  const getString = (selector: string) => {
    return root
      .find(selector)
      .toArray()
      .map(d => d.children.map(c => c.data))
      .reduce((acc, val) => acc.concat(val), [])
      .join(', ');
  };

  const getImage = () =>
    root.find('.responsive-product-square img')[0]?.attribs['src'] || '';

  const title = getString('.bc-list-item h3 a');
  const subtitle = getString('.subtitle span');
  const year = new Date(stringToUtc(getString('.releaseDateLabel span')));
  const narrator = getString('.narratorLabel span a');
  const author = getString('.authorLabel span a');
  const runtime = runtimeStringToNumber(getString('.runtimeLabel span'));
  const language = getString('.languageLabel span')
    .split(':')
    .pop()
    .trim();
  const stars = starsStringToNumber(
    getString('.ratingsLabel .bc-pub-offscreen')
  );
  const ratings = ratingsStringToNumber(
    getString('.ratingsLabel .bc-color-secondary')
  );
  const image = getImage();

  return {
    id,
    title,
    subtitle,
    year,
    narrator,
    author,
    runtime,
    language,
    stars,
    ratings,
    image,
    folder,
    description,
    link,
    lastUpdatedUtc: new Date(),
    dateCreatedUtc: new Date(),
  };
};

export const getDetailLink = async (searchHtml: string) => {
  const searchPage = cheerio.load(searchHtml);
  const firstItem = searchPage('.productListItem')[0];
  const root = searchPage(firstItem);
  const detailLink =
    root
      .find('.bc-list-item h3 a')
      .toArray()
      .pop()
      ?.attribs['href']?.split('?')
      ?.shift() || '';
  return `https://www.audible.com${detailLink}`;
};

export const getDetail = (detailHtml: string) => {
  const detailPage = cheerio.load(detailHtml);

  return (
    detailPage('.productPublisherSummary')
      .find('.bc-text')
      .html() || ''
  );
};
