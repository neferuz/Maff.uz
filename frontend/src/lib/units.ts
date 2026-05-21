export function getProductUnit(title: string = "", categoryName: string = ""): "м²" | "шт" {
  const nameLower = title.toLowerCase();
  const catLower = categoryName.toLowerCase();

  const pieceKeywords = [
    "плинтус",
    "порог",
    "ручк",
    "двер",
    "door",
    "наличник",
    "коробк",
    "петл",
    "замок",
    "добор",
    "комплект",
    "ручка",
    "ручки"
  ];

  const doorBrands = [
    "portika",
    "zadoor",
    "profildoors",
    "волховец",
    "volkhovets",
    "filomuro"
  ];

  const isPiece =
    pieceKeywords.some((kw) => nameLower.includes(kw) || catLower.includes(kw)) ||
    doorBrands.some((brand) => nameLower.includes(brand));

  return isPiece ? "шт" : "м²";
}
