			const stageImage = document.getElementById("stage-image");
			const dropInImage = document.getElementById("drop-in-image");
			const draggedImage = document.getElementById("dragged-image");

			const userLeo = document.getElementById("user-leo");
			const userZoe = document.getElementById("user-zoe");
			const leoCursor = document.getElementById("leo-cursor");
			const zoeCursor = document.getElementById("zoe-cursor");

			const clickLeo = document.getElementById("click-leo");
			const clickZoe = document.getElementById("click-zoe");

			const stageFadeInDuration = 0.7;
			const stageFadeOutDuration = 0.7;
			const repeatDelay = 1.8;

			const times = {
				stage1: 0.0,
				leoIntro: 0.5,
        stage2: 1.3,
				leoFocus: 1.4,
				leoClick: 1.8,
        stage3: 1.85,
        leoStay:  2.5,
        leoDown: 3.25,
				zoeIntro: 4.1,
				zoeFocus: 5.1,
				zoeClick: 5.5,
        stage4: 5.55,
        zoeStay: 6,
        zoeOptions: 6.5,
        zoeClickOptions: 7.0,
        dropInStart: 7.5,
				dropInSettled: 8.0,
        zoeOptionsStay: 8.0,
        zoeImage: 8.5,
        zoeClickImage: 9.0,
        stage5: 9.5,
        zoeImageStay: 10.0,
        zoeOut: 10.5,
				usersExit: 14.0,
				loopEnd: 16.0,
			};

			const stageSequence = [
				{ at: times.stage1, src: "assets/stage-1.svg" },
				{ at: times.stage2, src: "assets/stage-2.svg" },
				{ at: times.stage3, src: "assets/stage-3.svg" },
				{ at: times.stage4, src: "assets/stage-4.svg" },
				{ at: times.stage5, src: "assets/stage-5.svg" },
			];

			const dropInFadeOutStart = times.stage5 - 0.3;
			const dropInFadeOutDuration = 0.5;
			const dropInKeyframes = [
				{ at: times.dropInStart, autoAlpha: 0, scale: 1.18, ease: "none" },
				{ at: times.dropInSettled, autoAlpha: 1, scale: 1, ease: "power2.out" },
				{ at: dropInFadeOutStart, autoAlpha: 1, scale: 1, ease: "none" },
				{ at: dropInFadeOutStart + dropInFadeOutDuration, autoAlpha: 0, scale: 1, ease: "power1.in" },
			];

			// ─── Actor keyframes ─────────────────────────────────────────────
			// To add a new stop, insert an entry between any two existing ones.
			const leoKeyframes = [
				{ at: times.leoIntro, left: "80%",  top: "36%",  autoAlpha: 0,  ease: "none"        },
				{ at: times.leoFocus, left: "37%",  top: "29%",  autoAlpha: 1,  ease: "power1.out" },
        { at: times.leoStay,  left: "37%",  top: "29%",  autoAlpha: 1,  ease: "none" },
        { at: times.leoDown,  left: "30%",  top: "43%",  autoAlpha: 0,  ease: "power1.in" },
			];

			const zoeKeyframes = [
				{ at: times.zoeIntro,         left: "00%",  top: "78%", autoAlpha: 0,  ease: "none"        },
				{ at: times.zoeFocus,         left: "35%",  top: "38%", autoAlpha: 1,  ease: "power1.out" },
				{ at: times.zoeStay,          left: "35%",  top: "38%", autoAlpha: 1,  ease: "none"        },
				{ at: times.zoeOptions,       left: "11%",  top: "31%", autoAlpha: 1,  ease: "power1.out" },
				{ at: times.zoeOptionsStay,   left: "11%",  top: "31%", autoAlpha: 1,  ease: "none"        },
				{ at: times.zoeImage,         left: "45%",  top: "63%", autoAlpha: 1,  ease: "power1.out" },
				{ at: times.zoeImageStay,     left: "45%",  top: "63%", autoAlpha: 1,  ease: "none"        },
				{ at: times.zoeOut,           left: "47%",  top: "68%", autoAlpha: 0,  ease: "power1.in"  },
			];

			const clickKeyframes = [
				{ at: times.leoClick, userElement: userLeo, cursorElement: leoCursor, indicatorElement: clickLeo, anchorX: 0, anchorY: 0 },
				{ at: times.zoeClick, userElement: userZoe, cursorElement: zoeCursor, indicatorElement: clickZoe, anchorX: 0.85, anchorY: 0 },
				{ at: times.zoeClickOptions, userElement: userZoe, cursorElement: zoeCursor, indicatorElement: clickZoe, anchorX: 0.85, anchorY: 0 },
				{ at: times.zoeClickImage, userElement: userZoe, cursorElement: zoeCursor, indicatorElement: clickZoe, anchorX: 0.85, anchorY: 0 },
			];

			const preloadAssets = [
				"assets/stage-1.svg",
				"assets/stage-2.svg",
				"assets/stage-3.svg",
				"assets/stage-4.svg",
				"assets/stage-5.svg",
				"assets/dragged-1.svg",
				"assets/drop-in-stage-1.svg",
				"../assets/shared/user-leo-cursor.svg",
				"../assets/shared/user-leo-label.svg",
				"../assets/shared/user-zoe-cursor.svg",
				"../assets/shared/user-zoe-label.svg",
			];

			preloadAssets.forEach((src) => {
				const preloadedImage = new Image();
				preloadedImage.src = src;
			});

			function triggerUserClick(userElement, cursorElement, indicatorElement, anchorX, anchorY) {
				const clickX = userElement.offsetLeft + userElement.offsetWidth * anchorX;
				const clickY = userElement.offsetTop + userElement.offsetHeight * anchorY;

				gsap.killTweensOf(cursorElement);
				gsap.killTweensOf(indicatorElement);

				gsap.fromTo(
					cursorElement,
					{ x: 0, y: 0, rotation: 0, scale: 1 },
					{
						duration: 0.1,
						x: anchorX < 0.5 ? 2 : -2,
						y: 2,
						rotation: anchorX < 0.5 ? -3 : 3,
						scale: 0.9,
						yoyo: true,
						repeat: 1,
						ease: "power1.out",
						onComplete: () => {
							gsap.set(cursorElement, { x: 0, y: 0, rotation: 0, scale: 1 });
						},
					}
				);

				gsap.killTweensOf(indicatorElement);
				gsap.set(indicatorElement, { left: clickX, top: clickY, scale: 0.4, autoAlpha: 1 });
				gsap.to(indicatorElement, { duration: 0.35, scale: 1.4, autoAlpha: 0, ease: "power1.out" });
			}

			gsap.set(stageImage, { autoAlpha: 0 });
			gsap.set(dropInImage, { autoAlpha: dropInKeyframes[0].autoAlpha, scale: dropInKeyframes[0].scale });
			gsap.set(draggedImage, { autoAlpha: 0, scale: 1 });

			gsap.set(userLeo, { autoAlpha: 0, left: leoKeyframes[0].left, top: leoKeyframes[0].top });
			gsap.set(userZoe, { autoAlpha: 0, left: zoeKeyframes[0].left, top: zoeKeyframes[0].top });
			gsap.set([leoCursor, zoeCursor], { rotation: 0, scale: 1, x: 0, y: 0 });
			gsap.set([clickLeo, clickZoe], { autoAlpha: 0 });

			const timeline = gsap.timeline({ repeat: -1, repeatDelay });

			timeline.to(
				stageImage,
				{
					duration: stageFadeInDuration,
					autoAlpha: 1,
					ease: "power1.out",
				},
				times.stage1
			);

			stageSequence.forEach(({ at, src }) => {
				timeline.call(() => {
					stageImage.src = src;
				}, [], at);
			});

			for (let i = 1; i < dropInKeyframes.length; i++) {
				const prev = dropInKeyframes[i - 1];
				const { at, autoAlpha, scale, ease = "none" } = dropInKeyframes[i];
				timeline.to(dropInImage, { duration: at - prev.at, autoAlpha, scale, ease }, prev.at);
			}

			timeline.to(
				draggedImage,
				{
					duration: 0.45,
					autoAlpha: 1,
					ease: "power1.out",
				},
				times.leoIntro
			);

			for (let i = 1; i < leoKeyframes.length; i++) {
				const prev = leoKeyframes[i - 1];
				const { at, left, top, autoAlpha, ease = "none" } = leoKeyframes[i];
				timeline.to(userLeo, { duration: at - prev.at, left, top, autoAlpha, ease }, prev.at);
			}

			timeline.set(draggedImage, { autoAlpha: 0 }, times.leoClick);

			for (let i = 1; i < zoeKeyframes.length; i++) {
				const prev = zoeKeyframes[i - 1];
				const { at, left, top, autoAlpha, ease = "none" } = zoeKeyframes[i];
				timeline.to(userZoe, { duration: at - prev.at, left, top, autoAlpha, ease }, prev.at);
			}

			clickKeyframes.forEach(({ at, userElement, cursorElement, indicatorElement, anchorX, anchorY }) => {
				timeline.call(() => {
					triggerUserClick(userElement, cursorElement, indicatorElement, anchorX, anchorY);
				}, [], at);
			});

			timeline.to(
				[userLeo, userZoe],
				{
					duration: 0.5,
					autoAlpha: 0,
					ease: "power1.in",
				},
				times.usersExit
			);

			const fadeOutAt = Math.max(times.loopEnd - stageFadeOutDuration, stageFadeInDuration);

			timeline.to(
				[stageImage, dropInImage, draggedImage],
				{
					duration: stageFadeOutDuration,
					autoAlpha: 0,
					ease: "power1.in",
				},
				fadeOutAt
			);

			timeline.call(() => {
				gsap.set(stageImage, { autoAlpha: 0 });
				gsap.set(dropInImage, { autoAlpha: dropInKeyframes[0].autoAlpha, scale: dropInKeyframes[0].scale });
				gsap.set(draggedImage, { autoAlpha: 0, scale: 1 });
				gsap.set(userLeo, { autoAlpha: 0, left: leoKeyframes[0].left, top: leoKeyframes[0].top });
				gsap.set(userZoe, { autoAlpha: 0, left: zoeKeyframes[0].left, top: zoeKeyframes[0].top });
				gsap.set([leoCursor, zoeCursor], { rotation: 0, scale: 1, x: 0, y: 0 });
				gsap.set([clickLeo, clickZoe], { autoAlpha: 0 });
			}, [], times.loopEnd);
