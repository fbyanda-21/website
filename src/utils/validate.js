function requireNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUrlLikelyHttp(url) {
  return /^https?:\/\//i.test(url);
}

function isTikTokUrl(url) {
  return /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//i.test(url);
}

function isInstagramUrl(url) {
  return /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//i.test(url) ||
    /^https?:\/\/instagr\.am\//i.test(url);
}

function isYouTubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url);
}

function isFacebookUrl(url) {
  return /^https?:\/\/(www\.)?(facebook\.com|fb\.watch)\//i.test(url);
}

module.exports = {
  requireNonEmptyString,
  isUrlLikelyHttp,
  isTikTokUrl,
  isInstagramUrl,
  isYouTubeUrl,
  isFacebookUrl
};
