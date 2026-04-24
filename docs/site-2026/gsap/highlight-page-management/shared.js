			const animation = document.getElementById("animation");
			const stageImage = document.getElementById("stage-image");
			const cursorImage = document.getElementById("cursor-image");
			const cursorClick = document.getElementById("cursor-click");

			const cursorSource = "../assets/shared/user-2.svg";

			const stageFadeInDuration = 0.35;
			const stageFadeOutDuration = 0.35;
			const repeatDelay = 1.8;

			const cursorAnchor = {
				x: 0,
				y: 0,
			};

			const times = {
				stage1: 0.0,
				cursorIntro: 1.4,
				cursorToSwitch: 2.4,
				clickSwitch1: 3.2,
				stage2a: 3.6,
				clickSwitch2: 4.7,
				stage1b: 5.1,
				clickSwitch3: 6.2,
				stage2b: 6.6,
				cursorStay: 7.2,
				cursorToLocalButton: 8.5,
				clickUseLocal: 9.2,
				stage3: 9.7,
				cursorOut: 11.0,
				fadeOutStart: 13.7,
				loopEnd: 14.7,
			};

			const stageSequence = [
				{ at: times.stage1, src: "assets/stage-1.svg" },
				{ at: times.stage2a, src: "assets/stage-2.svg" },
				{ at: times.stage1b, src: "assets/stage-1.svg" },
				{ at: times.stage2b, src: "assets/stage-2.svg" },
				{ at: times.stage3, src: "assets/stage-3.svg" },
			];

			const cursorKeyframes = [
				{ at: times.cursorIntro, left: "26%", top: "15%", autoAlpha: 0, rotation: 16 },
				{ at: times.cursorToSwitch, left: "20%", top: "4%", autoAlpha: 1, rotation: 78, ease: "power1.out" },
        { at: times.cursorStay, left: "20%", top: "4%", autoAlpha: 1, rotation: 78, ease: "none" },
				{ at: times.cursorToLocalButton, left: "60%", top: "4%", autoAlpha: 1, rotation: 25, ease: "power1.out" },
				{ at: times.cursorOut, left: "60%", top: "4%", autoAlpha: 0, rotation: 25, ease: "power1.in" },
			];

			const cursorClickTimes = [times.clickSwitch1, times.clickSwitch2, times.clickSwitch3, times.clickUseLocal];
			const loopDuration = times.loopEnd;

			[...stageSequence.map((entry) => entry.src), cursorSource].forEach((src) => {
				const preloadedImage = new Image();
				preloadedImage.src = src;
			});

			gsap.set(stageImage, { autoAlpha: 0 });
			gsap.set(animation, { autoAlpha: 1 });

			function applyCursorState(frame) {
				gsap.set(cursorImage, {
					left: frame.left,
					top: frame.top,
					autoAlpha: frame.autoAlpha,
					rotation: frame.rotation ?? 0,
				});
			}

			function triggerCursorClick() {
				const left = cursorImage.offsetLeft + cursorImage.offsetWidth * cursorAnchor.x;
				const top = cursorImage.offsetTop + cursorImage.offsetHeight * cursorAnchor.y;

				gsap.killTweensOf(cursorImage, "x,y,scale");
				gsap.fromTo(
					cursorImage,
					{
						x: 0,
						y: 0,
						scale: 1,
					},
					{
						duration: 0.09,
						x: 2,
						y: 2,
						scale: 0.84,
						ease: "power2.out",
						repeat: 1,
						yoyo: true,
						clearProps: "x,y",
					}
				);

				gsap.killTweensOf(cursorClick);
				gsap.set(cursorClick, {
					left,
					top,
					scale: 0.4,
					autoAlpha: 1,
				});
				gsap.to(cursorClick, {
					duration: 0.35,
					scale: 1.4,
					autoAlpha: 0,
					ease: "power1.out",
				});
			}

			const timeline = gsap.timeline({ repeat: -1, repeatDelay });

			stageSequence.forEach(({ at, src }) => {
				timeline.call(() => {
					stageImage.src = src;
				}, [], at);
			});

			timeline.to(
				stageImage,
				{
					duration: stageFadeInDuration,
					autoAlpha: 1,
					ease: "power1.out",
				},
				0
			);

			applyCursorState(cursorKeyframes[0]);

			cursorKeyframes.slice(1).forEach((frame, index) => {
				const previousFrame = cursorKeyframes[index];
				const duration = frame.at - previousFrame.at;

				if (duration <= 0) {
					timeline.call(() => {
						applyCursorState(frame);
					}, [], frame.at);
					return;
				}

				timeline.to(
					cursorImage,
					{
						duration,
						left: frame.left,
						top: frame.top,
						autoAlpha: frame.autoAlpha,
						rotation: frame.rotation ?? 0,
						ease: frame.ease || "none",
					},
					previousFrame.at
				);
			});

			cursorClickTimes.forEach((at) => {
				timeline.call(() => {
					triggerCursorClick();
				}, [], at);
			});

			timeline.to(
				animation,
				{
					duration: stageFadeOutDuration,
					autoAlpha: 0,
					ease: "power1.in",
				},
				times.fadeOutStart
			);

			timeline.call(() => {
				stageImage.src = stageSequence[0].src;
				gsap.set(stageImage, { autoAlpha: 0 });
				gsap.set(animation, { autoAlpha: 1 });
				applyCursorState(cursorKeyframes[0]);
				gsap.set(cursorClick, { autoAlpha: 0, scale: 0.4 });
			}, [], loopDuration);
