export function tryOnOfferLine(wallet) {
  if (!wallet) return '';
  const price = Number(wallet.paidTryOnPriceInr);
  const priceText = Number.isFinite(price) ? `₹${price}` : '';
  const free = Number(wallet.freeRemaining) || 0;
  const paid = Number(wallet.paidRemaining) || 0;
  if (free > 0) {
    const left = `${free} free try-on${free === 1 ? '' : 's'} left`;
    return priceText ? `${left}. After that, each try-on is ${priceText}.` : left;
  }
  if (paid > 0) {
    return priceText
      ? `${paid} paid try-on${paid === 1 ? '' : 's'} left, at ${priceText} each.`
      : `${paid} paid try-on${paid === 1 ? '' : 's'} left`;
  }
  return priceText ? `Each try-on is ${priceText}.` : 'Free try-ons are used';
}

export function dash(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
  if (value == null) return '-';
  const text = String(value).trim();
  return text || '-';
}
