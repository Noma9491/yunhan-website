document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#consultation-form");
  const serviceSelect = document.querySelector("#service");
  const panels = document.querySelectorAll("[data-service-panel]");
  const summaryPanel = document.querySelector("#summary-panel");
  const summaryText = document.querySelector("#summary-text");
  const emailLink = document.querySelector("#email-link");
  const copyButton = document.querySelector("#copy-summary");
  const resetFromSummaryButton = document.querySelector("#reset-from-summary");
  const copyStatus = document.querySelector("#copy-status");
  const formStatus = document.querySelector("#form-status");
  const steps = document.querySelectorAll(".consultation-step");
  const allowedServices = new Set(["medical", "security", "ai", "website", "project", "unsure"]);
  const allowedTopics = new Set(["copyright", "privacy"]);
  const MAX_SUMMARY_LENGTH = 6000;
  const MAX_MAILTO_URL_LENGTH = 8000;
  const fieldLengthLimits = new Map([
    ["name", 80],
    ["organization", 120],
    ["email", 254],
    ["problem", 3000],
    ["timeline", 100],
    ["medical_deadline", 100],
    ["security_deadline", 100],
    ["security_scope_detail", 1000],
    ["security_report_detail", 1000],
    ["ai_workflow", 1000],
    ["ai_tools", 300],
    ["ai_data", 300],
    ["ai_sensitive", 300],
    ["ai_level", 300],
    ["ai_users", 200],
    ["ai_timeline", 100],
    ["website_industry", 200],
    ["website_launch", 100],
    ["project_goal", 1000],
    ["project_roles", 300],
    ["project_period", 100],
    ["project_challenge", 1000],
    ["project_role_needed", 300],
    ["project_scope_detail", 1000],
    ["project_docs_detail", 1000],
    ["unsure_context", 1000]
  ]);

  if (!form || !serviceSelect || !summaryPanel || !summaryText || !emailLink || !copyButton) {
    console.error("合作諮詢表單缺少必要元素，請檢查 contact.html。");
    return;
  }

  function setStep(step) {
    steps.forEach(function (item, index) {
      item.classList.toggle("is-active", index === step - 1);
    });
  }

  function setEmailLink(mailtoUrl) {
    emailLink.href = mailtoUrl;
    emailLink.removeAttribute("aria-disabled");
    emailLink.classList.remove("is-disabled");
  }

  function disableEmailLink() {
    emailLink.removeAttribute("href");
    emailLink.setAttribute("aria-disabled", "true");
    emailLink.classList.add("is-disabled");
  }

  function labelForControl(control) {
    if (control.dataset.summaryLabel) {
      return control.dataset.summaryLabel;
    }

    const label = control.id ? form.querySelector('label[for="' + control.id + '"]') : null;
    return label ? label.textContent.replace("*", "").replace("選填", "").trim() : control.name;
  }

  function validateFieldLengths() {
    for (const [name, maximumLength] of fieldLengthLimits) {
      const control = form.elements.namedItem(name);
      if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
        continue;
      }

      if (!control.disabled && control.value.length > maximumLength) {
        formStatus.textContent = labelForControl(control) + "超過 " + maximumLength + " 字元，請縮短後再繼續。";
        control.focus();
        return false;
      }
    }

    return true;
  }

  function clearControls(container) {
    container.querySelectorAll("input, select, textarea").forEach(function (control) {
      if (control.type === "checkbox" || control.type === "radio") {
        control.checked = false;
      } else if (control.tagName === "SELECT") {
        control.selectedIndex = 0;
      } else {
        control.value = "";
      }
    });
  }

  function updateConditionalDetails(container) {
    container.querySelectorAll("[data-reveal-for]").forEach(function (detail) {
      const source = form.querySelector("#" + detail.dataset.revealFor);
      const isVisible = source && source.value === "已有" && !detail.closest("[data-service-panel]").hidden;
      detail.hidden = !isVisible;
      detail.setAttribute("aria-hidden", String(!isVisible));
      detail.querySelectorAll("input, select, textarea").forEach(function (control) {
        control.disabled = !isVisible;
        if (!isVisible) {
          control.value = "";
        }
      });
    });
  }

  function setVisiblePanel(service) {
    panels.forEach(function (panel) {
      const isActive = panel.dataset.servicePanel === service;
      if (!isActive) {
        clearControls(panel);
      }
      panel.hidden = !isActive;
      panel.disabled = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.querySelectorAll("input, select, textarea").forEach(function (control) {
        control.disabled = !isActive;
      });
      updateConditionalDetails(panel);
    });
  }

  function textFromControl(control) {
    if (control.tagName === "SELECT") {
      const selectedOption = control.options[control.selectedIndex];
      return selectedOption ? selectedOption.text.trim() : "";
    }

    return control.value.trim();
  }

  function labelForGroup(controls) {
    const explicitLabel = controls.find(function (control) {
      return control.dataset.summaryLabel;
    });

    if (explicitLabel) {
      return explicitLabel.dataset.summaryLabel;
    }

    const control = controls[0];
    const label = control.id ? form.querySelector('label[for="' + control.id + '"]') : null;
    return label ? label.textContent.replace("*", "").replace("選填", "").trim() : control.name;
  }

  function collectSummaryLines() {
    const enabledControls = Array.from(form.querySelectorAll("input[name]:not(:disabled), select[name]:not(:disabled), textarea[name]:not(:disabled)")).filter(function (control) {
      return !control.hasAttribute("data-summary-ignore");
    });
    const groups = new Map();

    enabledControls.forEach(function (control) {
      if (!groups.has(control.name)) {
        groups.set(control.name, []);
      }
      groups.get(control.name).push(control);
    });

    const lines = [];

    groups.forEach(function (controls) {
      const firstControl = controls[0];
      let values = [];

      if (firstControl.type === "checkbox" || firstControl.type === "radio") {
        values = controls.filter(function (control) {
          return control.checked;
        }).map(function (control) {
          return control.value;
        });
      } else {
        const value = textFromControl(firstControl);
        if (value && value !== "請選擇") {
          values.push(value);
        }
      }

      if (values.length > 0) {
        lines.push(labelForGroup(controls) + "：" + values.join("、"));
      }
    });

    return lines;
  }

  function buildSummary() {
    const lines = collectSummaryLines();
    return [
      "蘊涵有限公司合作諮詢",
      "",
      ...lines,
      "",
      "提醒：此為初步諮詢內容，未附上密碼、金鑰、病患資料、完整原始碼或其他機密資訊。"
    ].join("\n");
  }

  function fallbackCopy(text) {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = text;
    temporaryField.setAttribute("readonly", "");
    temporaryField.className = "visually-hidden-copy-field";
    document.body.appendChild(temporaryField);
    temporaryField.select();
    const copied = document.execCommand("copy");
    temporaryField.remove();
    return copied;
  }

  serviceSelect.addEventListener("change", function () {
    setVisiblePanel(serviceSelect.value);
    summaryPanel.hidden = true;
    setEmailLink("mailto:yunhan31491@gmail.com");
    setStep(1);
    formStatus.textContent = serviceSelect.value ? "已顯示這項服務的補充問題。" : "";
  });

  form.addEventListener("change", function (event) {
    const source = event.target;
    if (source.matches("select#security-scope, select#security-report, select#project-scope, select#project-docs")) {
      const panel = source.closest("[data-service-panel]");
      if (panel) {
        updateConditionalDetails(panel);
      }
    }
  });

  form.querySelectorAll("[data-reveal-for]").forEach(function (detail) {
    const source = form.querySelector("#" + detail.dataset.revealFor);
    if (!source) {
      return;
    }

    ["change", "input"].forEach(function (eventName) {
      source.addEventListener(eventName, function () {
        const panel = source.closest("[data-service-panel]");
        if (panel) {
          updateConditionalDetails(panel);
        }
      });
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateFieldLengths()) {
      return;
    }

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid:not(:disabled)");
      formStatus.textContent = firstInvalid && firstInvalid.name === "privacyConsent"
        ? "請勾選隱私權保護聲明的確認欄位，才能進入下一步。"
        : "請完成標示為必填的欄位。";
      form.reportValidity();
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const summary = buildSummary();
    const name = form.elements.name.value.trim();
    const organization = form.elements.organization.value.trim();
    const selectedService = serviceSelect.options[serviceSelect.selectedIndex].text.trim();
    const subjectName = organization || name;
    const subject = "【蘊涵合作諮詢】" + selectedService + "｜" + subjectName;

    const mailtoUrl = "mailto:yunhan31491@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(summary);
    const isSummaryTooLong = summary.length > MAX_SUMMARY_LENGTH || mailtoUrl.length > MAX_MAILTO_URL_LENGTH;

    summaryText.textContent = summary;
    if (isSummaryTooLong) {
      disableEmailLink();
    } else {
      setEmailLink(mailtoUrl);
    }
    summaryPanel.hidden = false;
    setStep(2);
    formStatus.textContent = isSummaryTooLong
      ? "諮詢內容較長，請精簡部分內容，或複製摘要後以 Email 附件方式提供。"
      : "諮詢摘要已產生，請在下方確認後再使用 Email 寄出。";
    copyStatus.textContent = "";
    summaryPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    summaryText.focus({ preventScroll: true });
  });

  emailLink.addEventListener("click", function (event) {
    if (emailLink.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      formStatus.textContent = "諮詢內容較長，請精簡部分內容，或複製摘要後以 Email 附件方式提供。";
    }
  });

  copyButton.addEventListener("click", async function () {
    const summary = summaryText.textContent;
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary);
        copied = true;
      } else {
        copied = fallbackCopy(summary);
      }
    } catch (error) {
      console.error("複製諮詢摘要時發生錯誤：", error);
      copied = fallbackCopy(summary);
    }

    copyStatus.textContent = copied
      ? "諮詢摘要已複製，可以貼到你的 Email 中。"
      : "無法自動複製，請直接選取上方摘要文字。";
  });

  function finishReset() {
    setVisiblePanel("");
    summaryPanel.hidden = true;
    setStep(1);
    formStatus.textContent = "表單已清除。";
    copyStatus.textContent = "";
    setEmailLink("mailto:yunhan31491@gmail.com");
    document.querySelector("#consultation-form-title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("reset", function () {
    window.setTimeout(finishReset, 0);
  });

  if (resetFromSummaryButton) {
    resetFromSummaryButton.addEventListener("click", function () {
      form.reset();
    });
  }

  const searchParams = new URLSearchParams(window.location.search);
  const requestedService = searchParams.get("service");
  const requestedTopic = searchParams.get("topic");

  if (requestedService && allowedServices.has(requestedService)) {
    serviceSelect.value = requestedService;
    setVisiblePanel(requestedService);
  } else if (requestedTopic && allowedTopics.has(requestedTopic) && requestedTopic === "copyright") {
    serviceSelect.value = "unsure";
    form.elements.problem.value = "您好，我想詢問蘊涵網站內容的授權、轉載或權利相關事項。\n\n涉及內容或網址：\n使用目的或權利疑義：\n希望的處理方式：\n其他補充：";
    setVisiblePanel("unsure");
    formStatus.textContent = "已帶入著作權、內容授權或權利疑義的諮詢主題，可依實際情況修改。";
  } else if (requestedTopic && allowedTopics.has(requestedTopic) && requestedTopic === "privacy") {
    serviceSelect.value = "unsure";
    form.elements.problem.value = "您好，我想詢問蘊涵網站的個人資料或隱私權相關事項。\n\n事項類型：\n涉及的聯絡日期或專案：\n希望處理的事項：\n其他補充：";
    setVisiblePanel("unsure");
    formStatus.textContent = "已帶入個人資料或隱私權相關主題，可依實際情況修改。";
  } else {
    setVisiblePanel(serviceSelect.value);
  }
  setStep(1);
});
