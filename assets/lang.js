/* ── 한/영 언어 전환 ─────────────────────────────── */
(function () {
  var KEY = "site-lang";
  var lang = localStorage.getItem(KEY) || "ko";

  // <head>에서 즉시 실행되어 화면 깜빡임(FOUC)을 막는다.
  document.documentElement.setAttribute("data-lang", lang);

  function apply(next) {
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.lang = next;
    localStorage.setItem(KEY, next);
    var label = next === "ko" ? "EN" : "한국어";
    var aria = next === "ko" ? "Switch to English" : "한국어로 전환";
    document.querySelectorAll(".langtoggle").forEach(function (btn) {
      btn.textContent = label;
      btn.setAttribute("aria-label", aria);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(localStorage.getItem(KEY) || "ko");
    document.querySelectorAll(".langtoggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("data-lang");
        apply(cur === "ko" ? "en" : "ko");
      });
    });
  });
})();
