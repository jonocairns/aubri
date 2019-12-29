import cheerio from 'cheerio';
import { stringToUtc, runtimeStringToNumber, starsStringToNumber, ratingsStringToNumber } from './scraperUtils';

export const scraper = async (searchHtml: string) => {
    const searchPage = cheerio.load(searchHtml);
    const firstItem = searchPage('.productListItem')[0];
    const root = searchPage(firstItem);

    const detailLink =
        root
            .find('.bc-list-item h3 a')
            .toArray()
            .pop()
            ?.attribs['href']
            ?.split('?')
            ?.shift() || '';
    const fullLink = `https://www.audible.com${detailLink}`;

    const getString = (selector: string) => {
        return root
            .find(selector)
            .toArray()
            .map(d => d.children.map(c => c.data))
            .reduce((acc, val) => acc.concat(val), [])
            .join(', ');
    };

    const getImage = () => root
        .find('.responsive-product-square img')[0]?.attribs[
        'src'
    ] || '';


    const title = getString('.bc-list-item h3 a');
    const subtitle = getString('.subtitle span');
    const year = stringToUtc(getString('.releaseDateLabel span'));
    const narrator = getString('.narratorLabel span a');
    const author = getString('.authorLabel span a');
    const runtime = runtimeStringToNumber(getString('.runtimeLabel span'));
    const language = getString('.languageLabel span').split(':').pop().trim();
    const stars = starsStringToNumber(getString('.ratingsLabel .bc-pub-offscreen'));
    const ratings = ratingsStringToNumber(getString('.ratingsLabel .bc-color-secondary'));
    const image = getImage();


    return {
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
        fullLink
    };
};

export const getDetail = (detailHtml: string) => {
    const detailPage = cheerio.load(detailHtml);

    const firstItem = detailPage('.productPublisherSummary')[0];

    return detailPage(firstItem).html();
}