			const stageImage = document.getElementById("stage-image");
			const dropIn1 = document.getElementById("drop-in-1");
			const dropIn2 = document.getElementById("drop-in-2");
			const dropIn3 = document.getElementById("drop-in-3");
			const dropIn4 = document.getElementById("drop-in-4");
			const dropIn5 = document.getElementById("drop-in-5");
			const dropIn6 = document.getElementById("drop-in-6");

			const stageFadeInDuration = 0.35;
			const stageFadeOutDuration = 0.35;
			const repeatDelay = 1.8;

			const times = {
				stageVisible: 0.0,
				comment1Start: 0.8,
				comment1Line1Start: 1.1,
				comment1Line1Settled: 1.45,
				comment1Line2Start: 1.6,
				comment1Line2Settled: 1.95,
				comment2Start: 2.2,
				comment2TextStart: 2.5,
				comment2TextSettled: 2.85,
				emojiStart: 3.2,
				emojiSettled: 3.65,
				loopEnd: 5.8,
			};

			const dropInSequence = [
				{ element: dropIn1, at: times.comment1Start, settledAt: times.comment1Start + 0.3, startScale: 1.18 },
				{ element: dropIn2, at: times.comment1Line1Start, settledAt: times.comment1Line1Settled, startScale: 1.18 },
				{ element: dropIn3, at: times.comment1Line2Start, settledAt: times.comment1Line2Settled, startScale: 1.18 },
				{ element: dropIn4, at: times.comment2Start, settledAt: times.comment2Start + 0.3, startScale: 1.18 },
				{ element: dropIn5, at: times.comment2TextStart, settledAt: times.comment2TextSettled, startScale: 1.18 },
				{ element: dropIn6, at: times.emojiStart, settledAt: times.emojiSettled, startScale: 1.28, isEmoji: true },
			];

			[
				"assets/stage-1.svg",
				"assets/drop-in-stage-1.svg",
				"assets/drop-in-stage-2.svg",
				"assets/drop-in-stage-3.svg",
				"assets/drop-in-stage-4.svg",
				"assets/drop-in-stage-5.svg",
			"assets/pop-up-stage-1.png",
		].forEach((src) => {
			const preloadedImage = new Image();
			preloadedImage.src = src;
		});

		gsap.set(stageImage, { autoAlpha: 0 });
		dropInSequence.forEach(({ element, startScale }) => {
			gsap.set(element, { autoAlpha: 0, scale: startScale });
		});

		const timeline = gsap.timeline({ repeat: -1, repeatDelay });

		timeline.to(
			stageImage,
			{
				duration: stageFadeInDuration,
				autoAlpha: 1,
				ease: "power1.out",
			},
			times.stageVisible
		);

		dropInSequence.forEach(({ element, at, settledAt, startScale, isEmoji }) => {
			timeline.set(
				element,
				{
					autoAlpha: 0,
					scale: startScale,
				},
				at
			);

			timeline.to(
				element,
				{
					duration: settledAt - at,
					autoAlpha: 1,
					scale: 1,
					ease: "power2.out",
				},
				at
			);
		});

		// Pop-up animation for emoji
		timeline.set(
			dropIn6,
			{
				autoAlpha: 0,
				scale: 0.75,
			},
			times.emojiStart
		);

		// Pop up phase
		timeline.to(
			dropIn6,
			{
				duration: 0.3,
				autoAlpha: 1,
				scale: 1.25,
				ease: "power2.out",
			},
			times.emojiStart
		);

		// Settle phase
		timeline.to(
			dropIn6,
			{
				duration: 0.15,
				scale: 1,
				ease: "power2.out",
			},
			times.emojiStart + 0.3
		);

		// Settle phase
		timeline.to(
			dropIn6,
			{
				duration: 0.15,
				scale: 1,
				ease: "power2.out",
			},
			times.emojiStart + 0.3
		);

		const fadeOutAt = Math.max(times.loopEnd - stageFadeOutDuration, stageFadeInDuration);

		timeline.to(
			[stageImage, dropIn1, dropIn2, dropIn3, dropIn4, dropIn5, dropIn6],
			{
				duration: stageFadeOutDuration,
				autoAlpha: 0,
				ease: "power1.in",
			},
			fadeOutAt
		);

			timeline.call(() => {
				gsap.set(stageImage, { autoAlpha: 0 });
				dropInSequence.forEach(({ element, startScale }) => {
					gsap.set(element, { autoAlpha: 0, scale: startScale });
				});
			}, [], times.loopEnd);
