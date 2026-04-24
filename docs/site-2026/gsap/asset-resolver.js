(function () {
  "use strict";

  function getLocaleFromPath() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    var folder = parts[parts.length - 2] || "";

    if (folder.endsWith("-de")) {
      return "de";
    }

    if (folder.endsWith("-en")) {
      return "en";
    }

    return "en";
  }

  function resolveAsset(fileName, options) {
    var opts = options || {};
    var localBase = opts.localBase || "assets";
    var sharedBase = opts.sharedBase || "../assets/shared";
    var useSharedFirst = Boolean(opts.useSharedFirst);

    var localPath = localBase.replace(/\/$/, "") + "/" + fileName;
    var sharedPath = sharedBase.replace(/\/$/, "") + "/" + fileName;

    return useSharedFirst ? [sharedPath, localPath] : [localPath, sharedPath];
  }

  function preloadAssetCandidates(candidates) {
    candidates.forEach(function (src) {
      var preloadedImage = new Image();
      preloadedImage.src = src;
    });
  }

  function setImageSourceWithFallback(imgElement, candidates) {
    if (!imgElement || !candidates || candidates.length === 0) {
      return;
    }

    var index = 0;

    function tryNext() {
      if (index >= candidates.length) {
        return;
      }

      var src = candidates[index++];
      imgElement.onerror = tryNext;
      imgElement.src = src;
    }

    tryNext();
  }

  function applyDefaultImageFallback() {
    var images = document.querySelectorAll('img[src^="assets/"]');

    images.forEach(function (imgElement) {
      var src = imgElement.getAttribute("src");
      if (!src) {
        return;
      }

      var fileName = src.split("/").pop();
      if (!fileName) {
        return;
      }

      var candidates = resolveAsset(fileName);
      var fallbackIndex = 1;

      imgElement.addEventListener("error", function onError() {
        if (fallbackIndex >= candidates.length) {
          imgElement.removeEventListener("error", onError);
          return;
        }

        imgElement.src = candidates[fallbackIndex++];
      });
    });
  }

  window.GsapAssetResolver = {
    locale: getLocaleFromPath(),
    resolveAsset: resolveAsset,
    preloadAssetCandidates: preloadAssetCandidates,
    setImageSourceWithFallback: setImageSourceWithFallback,
    applyDefaultImageFallback: applyDefaultImageFallback,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDefaultImageFallback);
  } else {
    applyDefaultImageFallback();
  }
})();
