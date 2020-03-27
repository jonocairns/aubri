export const stringToUtc = (dateString: string): string => {
  const parsedDate = Date.parse(dateString);

  if (!isNaN(parsedDate)) {
    return new Date(dateString).toISOString();
  }
  return new Date().toISOString();
};

export const runtimeStringToNumber = (runtimeString: string): number => {
  const numbers = runtimeString.split(' ').filter(r => !isNaN(Number(r)));

  return (
    numbers
      .map(a => Number(a))
      .map((a, i) => (i === 0 && numbers.length > 1 ? a * 60 : a))
      .reduce((a, b) => a + b, 0) || 0
  );
};

export const starsStringToNumber = (item: string): number =>
  Number(item.split(' ').shift()) || 0;

export const ratingsStringToNumber = (item: string): number =>
  Number(
    item
      .replace(/,/g, '')
      .split(' ')
      .shift()
  ) || 0;
