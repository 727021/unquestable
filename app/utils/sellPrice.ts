export const getSellPrice = (buyPrice: number) => {
  // half the buy price, rounded to the nearest 25
  return Math.round(buyPrice / 2 / 25) * 25
}
