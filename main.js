/* =========================================================
   Better Call Saul Entertainment — site script
   ---------------------------------------------------------
   EDIT YOUR CONTACT DETAILS HERE. Every WhatsApp / Call /
   Email button and text on all 3 pages reads from this.
   ========================================================= */
const SHOP = {
  // WhatsApp number in international format, digits only (e.g. 254712345678)
  whatsapp: "254700000000",
  // Phone number for the "Call" buttons (e.g. +254712345678)
  phone: "+254700000000",
  // How the phone number is shown on the page
  phoneDisplay: "07XX XXX XXX",
  email: "hello@bettercallsaul.co.ke",
  location: "Location coming soon",
  hours: {
    "Mon – Fri": "8:00am – 9:00pm",
    "Saturday": "8:00am – 9:00pm",
    "Sunday": "10:00am – 8:00pm",
  },
};

const waLink = (text) =>
  `https://wa.me/${SHOP.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/* ---------- Fill contact details everywhere ---------- */
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.wa || "Hi Better Call Saul Ent! 🎬");
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-call]").forEach((a) => (a.href = `tel:${SHOP.phone}`));
document.querySelectorAll("[data-mail]").forEach((a) => (a.href = `mailto:${SHOP.email}`));
document.querySelectorAll("[data-text='phone']").forEach((el) => (el.textContent = SHOP.phoneDisplay));
document.querySelectorAll("[data-text='email']").forEach((el) => (el.textContent = SHOP.email));
document.querySelectorAll("[data-text='location']").forEach((el) => (el.textContent = SHOP.location));
document.querySelectorAll("[data-text='year']").forEach((el) => (el.textContent = new Date().getFullYear()));

const hoursList = document.querySelector("[data-hours]");
if (hoursList) {
  hoursList.innerHTML = Object.entries(SHOP.hours)
    .map(([day, time]) => `<dt>${day}</dt><dd>${time}</dd>`)
    .join("");
}

/* ---------- Mobile nav ---------- */
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });
}

/* ---------- Marquee light bulbs around the hero photo ---------- */
document.querySelectorAll(".bulbs").forEach((row) => {
  const vertical = row.classList.contains("left") || row.classList.contains("right");
  const count = vertical ? 9 : 12;
  row.innerHTML = "<span></span>".repeat(count);
});

/* ---------- Duplicate ticker & filmstrip so they loop seamlessly ---------- */
document.querySelectorAll(".ticker-track, .film-track").forEach((track) => {
  track.innerHTML += track.innerHTML;
  [...track.children].slice(track.children.length / 2).forEach((el) => el.setAttribute("aria-hidden", "true"));
});

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Film-leader countdown intro (home page, once per visit) ---------- */
const intro = document.querySelector(".intro");
if (intro) {
  let seen = false;
  try { seen = sessionStorage.getItem("bcs-intro") === "1"; } catch (e) { }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    intro.classList.add("done");
    try { sessionStorage.setItem("bcs-intro", "1"); } catch (e) { }
  };

  if (seen || reduce) {
    intro.remove();
  } else {
    const num = intro.querySelector("b");
    let n = 3;
    const tick = setInterval(() => {
      n -= 1;
      if (n === 0) {
        clearInterval(tick);
        finish();
      } else {
        num.textContent = n;
      }
    }, 550);
    intro.addEventListener("click", () => {
      clearInterval(tick);
      finish();
    });
  }
}

/* ---------- Booking form → WhatsApp or Email ---------- */
const form = document.querySelector("#booking-form");
if (form) {
  const today = new Date().toISOString().split("T")[0];
  form.querySelector("#date").min = today;

  const buildMessage = () => {
    const d = new FormData(form);
    const lines = [
      "Hi Better Call Saul Ent! 🎬 I'd like to book:",
      `• Name: ${d.get("name")}`,
      `• Service: ${d.get("service")}`,
      d.get("date") ? `• Date: ${d.get("date")}` : "",
      d.get("time") ? `• Time: ${d.get("time")}` : "",
      d.get("notes") ? `• Notes: ${d.get("notes")}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const via = e.submitter ? e.submitter.value : "whatsapp";
    const message = buildMessage();
    if (via === "email") {
      const subject = `Booking: ${form.service.value}`;
      window.location.href = `mailto:${SHOP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    } else {
      window.open(waLink(message), "_blank", "noopener");
    }
  });
}
