import { scraper, getDetail } from '../src/core/scraper';
import { searchPage, detailPage } from '../__mocks__/pages';
import { stringToUtc, runtimeStringToNumber, starsStringToNumber, ratingsStringToNumber } from '../src/core/scraperUtils';

describe('scraper tests', () => {
    it('can convert date string to UTC', () => {
        const input = '2013-03-21';
        const output = stringToUtc(input);

        expect(output).toBe('2013-03-21T00:00:00.000Z');
    });

    it('can runtime as a string in to a number', () => {
        const input = '10 hrs and 24 mins';
        const output = runtimeStringToNumber(input);

        expect(output).toBe(60 * 10 + 24);
    });

    it('can runtime as a string when only has minutes', () => {
        const input = '24 mins';
        const output = runtimeStringToNumber(input);

        expect(output).toBe(24);
    });

    it('can convert star ratings to numbers', () => {
        const ratings = 3.5;
        const input = `${ratings} out of 5`;
        const output = starsStringToNumber(input);

        expect(output).toBe(ratings);
    });

    it('can convert raw ratings to numbers', () => {
        const ratings = 343554;
        const input = `${ratings} ratings`;
        const output = ratingsStringToNumber(input);

        expect(output).toBe(ratings);
    });

    it('should correctly scrape the search page', async () => {
        const obj = await scraper(searchPage);
    
        expect(obj.title).toBe('The Martian');
        expect(obj.subtitle).toBe('');
        expect(obj.year).toBe('2013-03-21T11:00:00.000Z');
        expect(obj.narrator).toBe('R. C. Bray');
        expect(obj.author).toBe('Andy Weir');
        expect(obj.runtime).toBe(653);
        expect(obj.language).toBe('English');
        expect(obj.stars).toBe(5);
        expect(obj.image).toBe('https://m.media-amazon.com/images/I/51Lr5rAN6cL._SL500_.jpg');
        expect(obj.fullLink).toBe('https://www.audible.com/pd/The-Martian-Audiobook/B00B5HZGUG');
    });

    it('should correctly scrape the detail page', async () => {
        const description = getDetail(detailPage);

        expect(description).not.toBeNull();
        expect(description).not.toBe('');
    })

});

