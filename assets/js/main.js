/* =========================================================
   Mechanical Workshop — promotional site script (vanilla JS)
   ========================================================= */

/* =========================================================
   ▼▼▼  SITE SETTINGS — EDIT HERE  ▼▼▼
   ========================================================= */

/* Email that receives closed-test requests (used by "Request test access"). */
const TESTER_EMAIL = "mikulasik2@gmail.com";

/* Pre-filled email. Edit the text freely; encoding is handled automatically. */
const TESTER_EMAIL_SUBJECT = "Mechanical Workshop Closed Test";
const TESTER_EMAIL_BODY = [
  "Hi MikiForge Studio,",
  "",
  "I'd like to join the Mechanical Workshop Android closed test.",
  "",
  "Google Play Gmail:",
  "Android device:",
  "Reddit username (optional):",
  "",
  "I can stay enrolled for at least 14 days.",
  "",
  "Thanks!"
].join("\r\n");

/* AFTER PUBLIC RELEASE: paste the public Google Play store URL here,
   e.g. "https://play.google.com/store/apps/details?id=com.mechanicalworkshop.game".
   While empty, the "Become a tester" buttons open the tester dialog.
   When filled, every tester button turns into a "Get it on Google Play" link
   and the dialog is no longer used.
   Never put the closed-test opt-in link here: people who are not on the
   tester list would only see "App not available". */
const PLAY_STORE_URL = "";
const PLAY_STORE_LABEL = "Get it on Google Play";
const PLAY_STORE_LABEL_SHORT = "Google Play";

/* ▲▲▲  END OF SETTINGS  ▲▲▲ */


(function () {
  "use strict";

  /* ---------- Tester sign-up / release CTA ---------- */
  const testerLinks = document.querySelectorAll("[data-tester-link]");
  const tdlg = document.getElementById("tester-dialog");
  const playUrl = (PLAY_STORE_URL || "").trim();

  function buildMailto() {
    return "mailto:" + TESTER_EMAIL +
      "?subject=" + encodeURIComponent(TESTER_EMAIL_SUBJECT) +
      "&body=" + encodeURIComponent(TESTER_EMAIL_BODY);
  }

  if (playUrl) {
    // Released: every tester button becomes a store link.
    testerLinks.forEach(function (a) {
      a.href = playUrl; a.target = "_blank"; a.rel = "noopener";
      const l = a.querySelector("[data-cta-label]");
      const ls = a.querySelector("[data-cta-label-short]");
      if (l) l.textContent = PLAY_STORE_LABEL;
      if (ls) ls.textContent = PLAY_STORE_LABEL_SHORT;
    });
  } else if (tdlg && typeof tdlg.showModal === "function") {
    const mail = document.getElementById("tester-mailto");
    if (mail) mail.href = buildMailto();
    document.querySelectorAll("[data-tester-email]").forEach(function (a) {
      a.href = "mailto:" + TESTER_EMAIL; a.textContent = TESTER_EMAIL;
    });

    let tdlgOpener = null;
    testerLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        tdlgOpener = a;
        tdlg.showModal();
        document.documentElement.style.overflow = "hidden";
        const panel = tdlg.querySelector(".tdlg__body");
        if (panel) panel.scrollTop = 0;
      });
    });
    tdlg.querySelector("[data-tdlg-close]").addEventListener("click", function () { tdlg.close(); });
    // click outside the panel closes
    tdlg.addEventListener("click", function (e) { if (e.target === tdlg) tdlg.close(); });
    tdlg.addEventListener("close", function () {
      document.documentElement.style.overflow = "";
      if (tdlgOpener) tdlgOpener.focus();
    });
  }

  /* ---------- "Watch gameplay" scrolls to the player and starts it ---------- */
  const trailer = document.getElementById("trailer");
  document.querySelectorAll("[data-play-trailer]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!trailer) return;
      // A click is a user gesture, so playing with sound here is allowed and expected.
      setTimeout(function () {
        const p = trailer.play();
        if (p && p.catch) p.catch(function () {});
      }, 450);
    });
  });

  /* ---------- Screenshot viewer ---------- */
  const viewer = document.getElementById("viewer");
  const shots = Array.prototype.slice.call(document.querySelectorAll("[data-gallery] .shot"));
  if (!viewer || !shots.length || typeof viewer.showModal !== "function") return;

  const vImg = viewer.querySelector(".viewer__img");
  const vText = viewer.querySelector(".viewer__text");
  const vCount = viewer.querySelector(".viewer__count");
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + shots.length) % shots.length;
    const btn = shots[index];
    const thumb = btn.querySelector("img");
    vImg.src = btn.getAttribute("data-full");
    vImg.alt = thumb ? thumb.alt : "";
    vText.textContent = btn.getAttribute("data-caption") || "";
    vCount.textContent = (index + 1) + " / " + shots.length;
    // warm the next image
    const next = new Image();
    next.src = shots[(index + 1) % shots.length].getAttribute("data-full");
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    viewer.showModal();
    document.documentElement.style.overflow = "hidden";
  }

  function close() { viewer.close(); }

  viewer.addEventListener("close", function () {
    document.documentElement.style.overflow = "";
    vImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });

  shots.forEach(function (btn, i) {
    btn.addEventListener("click", function () { open(i); });
  });

  viewer.querySelector("[data-close]").addEventListener("click", close);
  viewer.querySelector("[data-prev]").addEventListener("click", function () { show(index - 1); });
  viewer.querySelector("[data-next]").addEventListener("click", function () { show(index + 1); });

  // click on the dark backdrop (not the image or buttons) closes
  viewer.addEventListener("click", function (e) {
    if (e.target === viewer || e.target.classList.contains("viewer__fig")) close();
  });

  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  });

  // swipe left / right on touch screens
  let startX = null, startY = null;
  viewer.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { startX = null; return; }
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();
