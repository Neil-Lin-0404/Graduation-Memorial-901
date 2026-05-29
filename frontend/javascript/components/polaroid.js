export function createPolaroid({ src, alt, caption }) {
  const figure = document.createElement("figure");
  figure.className = "polaroid lift-on-hover";

  const imgWrap = document.createElement("div");
  imgWrap.className = "polaroid__imgWrap";

  const img = document.createElement("img");
  img.className = "polaroid__img";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = src || "";
  img.alt = alt || "";

  const figcap = document.createElement("figcaption");
  figcap.className = "polaroid__caption";
  figcap.textContent = caption || "";

  imgWrap.append(img);
  figure.append(imgWrap, figcap);
  return figure;
}
