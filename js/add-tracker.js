/** Baidu Analytics */
var _hmt = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?cf10aaf0175b83ffccb0276a7a65b614";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();

/** Google Analytics */
(function () {
  var googleScript = document.createElement("script");
  googleScript.src = "https://www.googletagmanager.com/gtag/js?id=G-V0NB3342NG";
  googleScript.async = true;
  document.head.appendChild(googleScript);

  googleScript.onload = function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-V0NB3342NG");
  };
})();

/** Google Ad */
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-MS3N6Z8C");
