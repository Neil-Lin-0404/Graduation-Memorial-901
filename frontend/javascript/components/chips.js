export function createChip(text) {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = text || "";
  return span;
}
