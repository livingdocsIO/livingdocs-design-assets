(function () {
  "use strict";

  function ensureStyle() {
    if (document.getElementById("highlight-agency-shared-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "highlight-agency-shared-style";
    style.textContent = [
      "body {",
      "  margin: 0;",
      "  background: transparent;",
      "}",
      "#animation {",
      "  position: relative;",
      "  width: 100%;",
      "}",
      "#stage-image,",
      "#drop-in-image,",
      "#user-3 {",
      "  display: block;",
      "  width: 100%;",
      "  height: auto;",
      "}",
      "#stage-image {",
      "  position: relative;",
      "  z-index: 1;",
      "}",
      "#drop-in-image {",
      "  position: absolute;",
      "  inset: 0;",
      "  opacity: 0;",
      "  pointer-events: none;",
      "  z-index: 2;",
      "  transform-origin: 90.79% 67.11%;",
      "}",
      "#user-3 {",
      "  position: absolute;",
      "  width: 4.24%;",
      "  opacity: 0;",
      "  pointer-events: none;",
      "  z-index: 3;",
      "  transform: translate(-31.7073%, 0%);",
      "  transform-origin: 31.7073% 0%;",
      "}",
      ".click-indicator {",
      "  position: absolute;",
      "  width: 2.64%;",
      "  aspect-ratio: 1 / 1;",
      "  opacity: 0;",
      "  pointer-events: none;",
      "  z-index: 4;",
      "  transform-origin: 50% 50%;",
      "  border-radius: 50%;",
      "  background-color: #141414;",
      "  transform: translate(-50%, -50%);",
      "}",
    ].join("\n");

    document.head.appendChild(style);
  }

  function initHighlightAgencyAnimation(options) {
    if (!window.gsap) {
      throw new Error("GSAP is required before initializing highlight-agency animation.");
    }

    var opts = options || {};
    var locale = opts.locale || "en";
    var mountId = opts.mountId || "animation-root";
    var mount = document.getElementById(mountId);

    if (!mount) {
      throw new Error("Animation mount element not found: #" + mountId);
    }

    ensureStyle();

    var localAssetsBase = "../highlight-agency-" + locale + "/assets";

    function localAsset(fileName) {
      return localAssetsBase + "/" + fileName;
    }

    function sharedAsset(fileName) {
      return "../assets/shared/" + fileName;
    }

    mount.innerHTML = [
      '<div id="animation">',
      '  <img id="stage-image" src="' + localAsset("stage-1.svg") + '" alt="Animated agency dashboard preview" />',
      '  <img id="drop-in-image" src="' + localAsset("drop-in-stage-1.svg") + '" alt="" aria-hidden="true" />',
      '  <img id="user-3" src="' + sharedAsset("user-3.svg") + '" alt="" aria-hidden="true" />',
      '  <div id="click-indicator" class="click-indicator" aria-hidden="true"></div>',
      "</div>",
    ].join("\n");

    var stageImage = document.getElementById("stage-image");
    var dropInImage = document.getElementById("drop-in-image");
    var user3 = document.getElementById("user-3");
    var clickIndicator = document.getElementById("click-indicator");

    var stageFadeInDuration = 0.45;
    var stageFadeOutDuration = 0.45;
    var repeatDelay = 1.8;

    var times = {
      stage1: 0.0,
      userIntro: 0.9,
      stage2: 1.1,
      userThink: 2.25,
      plusHover: 3.0,
      plusClick: 3.25,
      stage3: 3.35,
      plusStay: 4.0,
      linkMove: 4.6,
      linkClick: 4.7,
      userExit: 5.05,
      dropInStart: 5.6,
      dropInSettled: 6.5,
      dropInHold: 9.0,
      loopEnd: 9.0,
    };

    var stageSequence = [
      { at: times.stage1, src: localAsset("stage-1.svg") },
      { at: times.stage2, src: localAsset("stage-2.svg") },
      { at: times.stage3, src: localAsset("stage-3.svg") },
    ];

    var userKeyframes = [
      { at: times.userIntro, left: "80%", top: "85%", rotation: 0, autoAlpha: 0, ease: "none" },
      { at: times.userThink, left: "73.5%", top: "66.0%", rotation: 0, autoAlpha: 1, ease: "power2.out" },
      { at: times.plusHover, left: "64.0%", top: "66.0%", rotation: -30, autoAlpha: 1, ease: "power1.inOut" },
      { at: times.plusStay, left: "64.0%", top: "66.0%", rotation: -30, autoAlpha: 1, ease: "none" },
      { at: times.linkMove, left: "96.0%", top: "66.0%", rotation: 50, autoAlpha: 1, ease: "power2.out" },
      { at: times.userExit, left: "96.0%", top: "66.2%", rotation: 50, autoAlpha: 0, ease: "power1.in" },
    ];

    var clickKeyframes = [
      { at: times.plusClick, x: 626, y: 248 },
      { at: times.linkClick, x: 949, y: 248 },
    ];

    var dropInKeyframes = [
      { at: times.dropInStart, autoAlpha: 0, scale: 2, ease: "none" },
      { at: times.dropInSettled, autoAlpha: 1, scale: 1, ease: "power2.out" },
      { at: times.dropInHold, autoAlpha: 1, scale: 1, ease: "none" },
    ];

    [
      localAsset("stage-1.svg"),
      localAsset("stage-2.svg"),
      localAsset("stage-3.svg"),
      localAsset("drop-in-stage-1.svg"),
      sharedAsset("user-3.svg"),
    ].forEach(function (src) {
      var preloadedImage = new Image();
      preloadedImage.src = src;
    });

    function triggerUserClick(clickX, clickY) {
      window.gsap.killTweensOf(user3, "x,y,scale");
      window.gsap.killTweensOf(clickIndicator);

      window.gsap.fromTo(
        user3,
        { x: 0, y: 0, scale: 1 },
        {
          duration: 0.1,
          x: -2,
          y: 2,
          scale: 0.92,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
          onComplete: function () {
            window.gsap.set(user3, { x: 0, y: 0, scale: 1 });
          },
        }
      );

      var clickLeftPercent = (clickX / 968) * 100;
      var clickTopPercent = (clickY / 376) * 100;

      window.gsap.set(clickIndicator, {
        left: clickLeftPercent + "%",
        top: clickTopPercent + "%",
        scale: 0.4,
        autoAlpha: 1,
      });
      window.gsap.to(clickIndicator, { duration: 0.35, scale: 1.4, autoAlpha: 0, ease: "power1.out" });
    }

    window.gsap.set(stageImage, { autoAlpha: 0 });
    window.gsap.set(dropInImage, { autoAlpha: dropInKeyframes[0].autoAlpha, scale: dropInKeyframes[0].scale });
    window.gsap.set(user3, {
      autoAlpha: 0,
      left: userKeyframes[0].left,
      top: userKeyframes[0].top,
      x: 0,
      y: 0,
      rotation: userKeyframes[0].rotation || 0,
      scale: 1,
    });
    window.gsap.set(clickIndicator, { autoAlpha: 0 });

    var timeline = window.gsap.timeline({ repeat: -1, repeatDelay: repeatDelay });

    timeline.to(
      stageImage,
      {
        duration: stageFadeInDuration,
        autoAlpha: 1,
        ease: "power1.out",
      },
      times.stage1
    );

    stageSequence.forEach(function (entry) {
      timeline.call(function () {
        stageImage.src = entry.src;
      }, [], entry.at);
    });

    for (var i = 1; i < userKeyframes.length; i++) {
      var prevUser = userKeyframes[i - 1];
      var currentUser = userKeyframes[i];
      timeline.to(
        user3,
        {
          duration: currentUser.at - prevUser.at,
          left: currentUser.left,
          top: currentUser.top,
          rotation: currentUser.rotation == null ? (prevUser.rotation || 0) : currentUser.rotation,
          autoAlpha: currentUser.autoAlpha,
          ease: currentUser.ease || "none",
        },
        prevUser.at
      );
    }

    for (var j = 1; j < dropInKeyframes.length; j++) {
      var prevDrop = dropInKeyframes[j - 1];
      var currentDrop = dropInKeyframes[j];
      timeline.to(
        dropInImage,
        {
          duration: currentDrop.at - prevDrop.at,
          autoAlpha: currentDrop.autoAlpha,
          scale: currentDrop.scale,
          ease: currentDrop.ease || "none",
        },
        prevDrop.at
      );
    }

    clickKeyframes.forEach(function (clickFrame) {
      timeline.call(function () {
        triggerUserClick(clickFrame.x, clickFrame.y);
      }, [], clickFrame.at);
    });

    var fadeOutAt = Math.max(times.loopEnd - stageFadeOutDuration, stageFadeInDuration);

    timeline.to(
      [stageImage, dropInImage, user3, clickIndicator],
      {
        duration: stageFadeOutDuration,
        autoAlpha: 0,
        ease: "power1.in",
      },
      fadeOutAt
    );

    timeline.call(function () {
      window.gsap.set(stageImage, { autoAlpha: 0 });
      window.gsap.set(dropInImage, { autoAlpha: dropInKeyframes[0].autoAlpha, scale: dropInKeyframes[0].scale });
      window.gsap.set(user3, {
        autoAlpha: 0,
        left: userKeyframes[0].left,
        top: userKeyframes[0].top,
        x: 0,
        y: 0,
        rotation: userKeyframes[0].rotation || 0,
        scale: 1,
      });
      window.gsap.set(clickIndicator, { autoAlpha: 0 });
    }, [], times.loopEnd);
  }

  window.initHighlightAgencyAnimation = initHighlightAgencyAnimation;
})();
