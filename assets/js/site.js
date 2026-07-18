document.addEventListener("DOMContentLoaded", function () {
  const openButtons = document.querySelectorAll("[data-dialog-open]");
  let activeDialog = null;
  let lastFocusedElement = null;

  function getFocusableElements(dialog) {
    return Array.from(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (element) {
      return !element.hasAttribute("hidden");
    });
  }

  function closeDialog() {
    if (!activeDialog) {
      return;
    }

    const dialogToClose = activeDialog;
    activeDialog.hidden = true;
    activeDialog = null;
    document.body.classList.remove("legal-dialog-open");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }

    lastFocusedElement = null;
    return dialogToClose;
  }

  function openDialog(dialog, trigger) {
    if (activeDialog && activeDialog !== dialog) {
      activeDialog.hidden = true;
    }

    activeDialog = dialog;
    lastFocusedElement = trigger;
    dialog.hidden = false;
    document.body.classList.add("legal-dialog-open");

    const closeButton = dialog.querySelector("button[data-dialog-close]");
    window.requestAnimationFrame(function () {
      if (closeButton) {
        closeButton.focus();
      }
    });
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const dialog = document.getElementById(button.dataset.dialogOpen);
      if (dialog) {
        openDialog(dialog, button);
      }
    });
  });

  document.addEventListener("click", function (event) {
    const closeTrigger = event.target instanceof Element
      ? event.target.closest("[data-dialog-close]")
      : null;

    if (activeDialog && closeTrigger && activeDialog.contains(closeTrigger)) {
      closeDialog();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!activeDialog) {
      return;
    }

    if (event.key === "Escape") {
      closeDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(activeDialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".site-header");
  const heroHalo = hero ? hero.querySelector(".hero-halo") : null;
  const heroLightMotion = hero ? hero.querySelector(".hero-light-motion") : null;

  if (!hero || !heroHalo || !heroLightMotion) {
    return;
  }

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMotionPreference = window.matchMedia("(max-width: 767px)");
  const pathElements = [
    hero.querySelector(".hero-light-path--01"),
    hero.querySelector(".hero-light-path--04"),
    hero.querySelector(".hero-light-path--02"),
    hero.querySelector(".hero-light-path--05"),
    hero.querySelector(".hero-light-path--06"),
    hero.querySelector(".hero-light-path--final")
  ];
  const nodeElements = [
    hero.querySelector(".hero-light-node--01"),
    hero.querySelector(".hero-light-node--04"),
    hero.querySelector(".hero-light-node--02"),
    hero.querySelector(".hero-light-node--05"),
    hero.querySelector(".hero-light-node--03"),
    hero.querySelector(".hero-light-node--final")
  ];
  let motionTimers = [];
  let isHeroVisible = false;

  function clearMotionTimers() {
    motionTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    motionTimers = [];
  }

  function restartAnimation(element, className) {
    if (!element) {
      return;
    }

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function scheduleMotion(delay, action) {
    const timer = window.setTimeout(function () {
      if (isHeroVisible && !motionPreference.matches && !document.hidden) {
        action();
      }
    }, delay);
    motionTimers.push(timer);
  }

  function startMotionCycle() {
    if (!isHeroVisible || motionPreference.matches || document.hidden) {
      return;
    }

    clearMotionTimers();

    if (mobileMotionPreference.matches) {
      scheduleMotion(5000, function () {
        restartAnimation(heroHalo, "is-activated");
      });
      scheduleMotion(13000, startMotionCycle);
      return;
    }

    const timeline = [
      [0, function () { restartAnimation(nodeElements[0], "is-active"); }],
      [300, function () { restartAnimation(pathElements[0], "is-active"); }],
      [900, function () { restartAnimation(pathElements[1], "is-active"); }],
      [1200, function () { restartAnimation(nodeElements[2], "is-active"); }],
      [1500, function () { restartAnimation(pathElements[2], "is-active"); }],
      [2200, function () { restartAnimation(pathElements[3], "is-active"); }],
      [2500, function () { restartAnimation(nodeElements[4], "is-active"); }],
      [2800, function () { restartAnimation(pathElements[4], "is-active"); }],
      [4000, function () { restartAnimation(pathElements[5], "is-active"); }],
      [4800, function () { restartAnimation(nodeElements[5], "is-active"); }],
      [5000, function () { restartAnimation(heroHalo, "is-activated"); }]
    ];

    timeline.forEach(function (timelineItem) {
      scheduleMotion(timelineItem[0], timelineItem[1]);
    });
    scheduleMotion(13000, startMotionCycle);
  }

  function pauseMotion() {
    clearMotionTimers();
    pathElements.concat(nodeElements).forEach(function (element) {
      if (element) {
        element.classList.remove("is-active");
      }
    });
    heroHalo.classList.remove("is-activated");
    hero.classList.add("is-motion-paused");
  }

  function resumeMotion() {
    if (!isHeroVisible || motionPreference.matches) {
      return;
    }

    clearMotionTimers();
    hero.classList.remove("is-motion-paused");
    startMotionCycle();
  }

  const heroObserver = new IntersectionObserver(
    function (entries) {
      const heroEntry = entries[0];
      isHeroVisible = Boolean(heroEntry && heroEntry.isIntersecting);

      if (isHeroVisible) {
        resumeMotion();
      } else {
        pauseMotion();
      }
    },
    { threshold: 0.25 }
  );

  function handleMotionPreferenceChange() {
    if (motionPreference.matches) {
      pauseMotion();
    } else {
      resumeMotion();
    }
  }

  function handleMobileMotionChange() {
    pauseMotion();
    resumeMotion();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pauseMotion();
    } else {
      resumeMotion();
    }
  }

  heroObserver.observe(hero);
  motionPreference.addEventListener("change", handleMotionPreferenceChange);
  mobileMotionPreference.addEventListener("change", handleMobileMotionChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  window.addEventListener(
    "pagehide",
    function () {
      clearMotionTimers();
      heroObserver.disconnect();
      motionPreference.removeEventListener("change", handleMotionPreferenceChange);
      mobileMotionPreference.removeEventListener("change", handleMobileMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    },
    { once: true }
  );
});
