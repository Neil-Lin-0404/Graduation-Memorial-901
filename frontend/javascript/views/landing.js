import { createLogger } from "../logger.js";
import { initHeroCopyDrag } from "../landingHero.js";

const log = createLogger("landing");

const HERO_IMAGE_SRC =
  "images/9th/group/HeroImage.jpg";

const GRADE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "7", label: "七年級" },
  { value: "8", label: "八年級" },
  { value: "9", label: "九年級" },
];

const PERSON_OPTIONS = [{ value: "all", label: "全部" }];

function createSelect(id, labelText, options) {
  const field = document.createElement("div");
  field.className = "field landing-filter";

  const label = document.createElement("label");
  label.className = "label-caps";
  label.htmlFor = id;
  label.textContent = labelText;

  const select = document.createElement("select");
  select.className = "input landing-filter__select";
  select.id = id;
  select.name = id;

  for (const opt of options) {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.append(option);
  }

  field.append(label, select);
  return { field, select };
}

export async function renderLandingView() {
  const page = document.createElement("article");
  page.className = "landing-page";

  const hero = document.createElement("section");
  hero.className = "landing-hero";
  hero.setAttribute("aria-label", "國中三年旅程");

  const img = document.createElement("img");
  img.className = "landing-hero__img";
  img.src = HERO_IMAGE_SRC;
  img.alt = "國中三年旅程";
  img.decoding = "async";
  img.fetchPriority = "high";
  img.addEventListener("error", () => {
    hero.classList.add("landing-hero--fallback");
    log.warn("heroImageLoadFailed", { src: HERO_IMAGE_SRC });
  });

  const overlay = document.createElement("div");
  overlay.className = "landing-hero__overlay";

  const title = document.createElement("h1");
  title.className = "landing-hero__title";
  title.textContent = "國中三年旅程";

  const years = document.createElement("p");
  years.className = "landing-hero__years";
  years.textContent = "2023/9/1(五) ~ 2026/6/5(五)";

  const copy = document.createElement("div");
  copy.className = "landing-hero__copy";
  copy.append(title, years);
  overlay.append(copy);
  hero.append(img, overlay);
  initHeroCopyDrag({ copy, bounds: overlay });

  const body = document.createElement("div");
  body.className = "landing-body container";

  const cta = document.createElement("section");
  cta.className = "landing-cta";

  const exploreBtn = document.createElement("button");
  exploreBtn.type = "button";
  exploreBtn.className = "ui-btn ui-btn--primary landing-cta__btn";
  exploreBtn.textContent = "探索旅程";
  exploreBtn.setAttribute("aria-disabled", "true");
  cta.append(exploreBtn);

  const timeline = document.createElement("section");
  timeline.className = "landing-timeline";
  timeline.id = "timeline";

  const timelineHead = document.createElement("h2");
  timelineHead.className = "headline-sm landing-timeline__heading";
  timelineHead.textContent = "時間軸";

  const filters = document.createElement("div");
  filters.className = "landing-timeline__filters";

  const grade = createSelect("filter-grade", "年級", GRADE_OPTIONS);
  const person = createSelect("filter-person", "人物", PERSON_OPTIONS);

  const onFilterChange = () => {
    log.debug("filtersChanged", {
      grade: grade.select.value,
      person: person.select.value,
    });
  };

  grade.select.addEventListener("change", onFilterChange);
  person.select.addEventListener("change", onFilterChange);

  filters.append(grade.field, person.field);

  const track = document.createElement("div");
  track.className = "landing-timeline__track";
  track.setAttribute("role", "region");
  track.setAttribute("aria-label", "時間軸內容");

  const placeholder = document.createElement("p");
  placeholder.className = "landing-timeline__placeholder muted";
  placeholder.textContent = "時間軸內容即將補上";
  track.append(placeholder);

  timeline.append(timelineHead, filters, track);
  body.append(cta, timeline);
  page.append(hero, body);

  return page;
}
