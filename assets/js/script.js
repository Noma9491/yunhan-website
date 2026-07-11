document.addEventListener("DOMContentLoaded", function () {
  console.log("Yunhan website loaded.");

  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("main section");

  console.log("找到選單數量：", navLinks.length);
  console.log("找到區塊數量：", sections.length);

  function clearActiveLinks() {
    navLinks.forEach(function (link) {
      link.classList.remove("active");
    });
  }

  function setActiveLink(sectionId) {
    clearActiveLinks();

    const activeLink = document.querySelector('.nav-links a[href="#' + sectionId + '"]');

    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      const targetId = link.getAttribute("href").replace("#", "");
      setActiveLink(targetId);
    });
  });

  function updateActiveOnScroll() {
    let currentSectionId = "";
    let maxVisibleHeight = 0;

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();

      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = visibleBottom - visibleTop;

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        currentSectionId = section.getAttribute("id");
      }
    });

    if (currentSectionId) {
      setActiveLink(currentSectionId);
    }
  }

  window.addEventListener("scroll", updateActiveOnScroll);
  updateActiveOnScroll();
});