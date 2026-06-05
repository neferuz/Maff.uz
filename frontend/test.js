const name = "OSB 2440x1220x9 mm Егора";
console.log(name.match(/\b(\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?)\b/i));
console.log(name.match(/(?:\b|^)(\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?)/i));
