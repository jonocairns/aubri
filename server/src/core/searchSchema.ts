export const searchSchema = [
  {
    name: 'year',
    target: '.releaseDateLabel span',
    multi: false,
    translate: (item: string): string => {
      const parsedDate = Date.parse(item);

      if (!isNaN(parsedDate)) {
        return new Date(item).toISOString();
      }
      return new Date().toISOString();
    },
  },
  {name: 'title', target: '.bc-list-item h3 a', multi: false},
  {name: 'subtitle', target: '.subtitle span', multi: false},
  {name: 'author', target: '.authorLabel span a', multi: true},
  {name: 'narrator', target: '.narratorLabel span a', multi: false},
  {
    name: 'runtime',
    target: '.runtimeLabel span',
    multi: false,
    translate: (searchItem: string): number =>
      searchItem
        .split(' ')
        .filter(r => !isNaN(Number(r)))
        .map(a => Number(a))
        .map((a, i) => (i === 0 ? a * 60 : a))
        .reduce((a, b) => a + b, 0) || 0,
  },
  {name: 'language', target: '.languageLabel span', multi: false},
  {
    name: 'stars',
    target: '.ratingsLabel .bc-pub-offscreen',
    multi: false,
    translate: (item: string): number => Number(item.split(' ').shift()) || 0,
  },
  {
    name: 'ratings',
    target: '.ratingsLabel .bc-color-secondary',
    multi: false,
    translate: (item: string): number =>
      Number(
        item
          .replace(/,/g, '')
          .split(' ')
          .shift()
      ) || 0,
  },
];
