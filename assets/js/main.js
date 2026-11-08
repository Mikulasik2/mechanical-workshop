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

/* GOOGLE PLAY: the app's package id. Every button marked data-store-link uses it.
   Desktop / iPhone: opens the Google Play web page (new tab).
   Android: opens the Play Store APP directly on the game's page (see openStore below). */
const PLAY_PACKAGE_ID = "com.mikiforgestudio.mechanicalworkshop";

/* ▲▲▲  END OF SETTINGS  ▲▲▲ */


(function () {
  "use strict";

  /* ---------- Tester sign-up / release CTA ---------- */
  const testerLinks = document.querySelectorAll("[data-tester-link]");
  const tdlg = document.getElementById("tester-dialog");

  function buildMailto() {
    return "mailto:" + TESTER_EMAIL +
      "?subject=" + encodeURIComponent(TESTER_EMAIL_SUBJECT) +
      "&body=" + encodeURIComponent(TESTER_EMAIL_BODY);
  }

  if (tdlg && typeof tdlg.showModal === "function") {
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

  /* ---------- Google Play buttons ----------
     A plain https link to play.google.com works everywhere, but on Android some
     browsers and most in-app browsers (Facebook, Instagram, TikTok, Messenger...)
     show the WEB page of the store, where installing is awkward. So on Android:
       - normal browsers (Chrome, Samsung Internet, Firefox, Edge, Opera):
         an intent:// link that opens the Play Store app directly; if the Play
         Store app is missing, the browser falls back to the web page by itself;
       - in-app browsers: market:// (handled by the Play Store app); if nothing
         happens within 1.5 s, the web page opens instead.
     Without JavaScript the button is still the normal https link. */
  const storeWeb = "https://play.google.com/store/apps/details?id=" + PLAY_PACKAGE_ID;
  const storeMarket = "market://details?id=" + PLAY_PACKAGE_ID;
  const storeIntent = "intent://details?id=" + PLAY_PACKAGE_ID +
    "#Intent;scheme=market;package=com.android.vending;" +
    "S.browser_fallback_url=" + encodeURIComponent(storeWeb) + ";end";
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const inAppBrowser = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|musical_ly|TikTok|BytedanceWebview|Snapchat|Line\/|Pinterest|; wv\)/i.test(ua);

  function openStore() {
    if (!inAppBrowser) {
      window.location.href = storeIntent;
      return;
    }
    let left = false;
    const onHide = function () { if (document.hidden) left = true; };
    document.addEventListener("visibilitychange", onHide);
    window.location.href = storeMarket;
    setTimeout(function () {
      document.removeEventListener("visibilitychange", onHide);
      if (!left && !document.hidden) window.location.href = storeWeb;
    }, 1500);
  }

  document.querySelectorAll("[data-store-link]").forEach(function (a) {
    a.href = storeWeb;
    if (isAndroid) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openStore();
      });
    } else {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

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
