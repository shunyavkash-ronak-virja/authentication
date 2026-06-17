document.addEventListener("DOMContentLoaded", () => {
  initializePasswordRules();
  initializeFormValidation();
  initializePasswordToggle();
  initializeErrorCleanup();
});

function initializePasswordRules() {
  const passwordInputs = document.querySelectorAll("[data-password-input]");

  passwordInputs.forEach((input) => {
    const wrapper = input.closest(".password-field-wrapper");

    if (!wrapper) return;
    const rulesBlock = wrapper.querySelector(".password-rules-block");
    if (!rulesBlock) return;

    input.addEventListener("input", () => {
      updatePasswordRules(input, rulesBlock);
    });
  });
}

function updatePasswordRules(input, rulesBlock) {
  const password = input.value;

  if (!password.trim()) {
    rulesBlock.classList.remove("show");
    resetPasswordRules(rulesBlock);
    return;
  }

  rulesBlock.classList.add("show");

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  updateRuleUI(rulesBlock, "length", rules.length);
  updateRuleUI(rulesBlock, "uppercase", rules.uppercase);
  updateRuleUI(rulesBlock, "number", rules.number);
  updateRuleUI(rulesBlock, "special", rules.special);
  updatePasswordStrength(rulesBlock, rules);
}

function updateRuleUI(rulesBlock, ruleName, isValid) {
  const ruleElement = rulesBlock.querySelector(`[data-rule="${ruleName}"]`);

  if (!ruleElement) return;

  const checkIcon = ruleElement.querySelector(".password-rules-icon-true");
  const minusIcon = ruleElement.querySelector(".password-rules-false");

  if (isValid) {
    ruleElement.classList.add("complete");
    checkIcon.classList.remove("icon-visibility");
    minusIcon.classList.add("icon-visibility");
  } else {
    ruleElement.classList.remove("complete");
    checkIcon.classList.add("icon-visibility");
    minusIcon.classList.remove("icon-visibility");
  }
}

function updatePasswordStrength(rulesBlock, rules) {
  const progressBar = rulesBlock.querySelector(".password-rules-progress-bar");
  const statusElement = rulesBlock.querySelector(".password-rules-status");
  const completedRules = Object.values(rules).filter(Boolean).length;

  let strengthText = "Weak";
  let strengthValue = 25;
  let strengthColor = "var(--red)";

  switch (completedRules) {
    case 2:
      strengthText = "Medium";
      strengthValue = 50;
      strengthColor = "var(--orange)";
      break;

    case 3:
      strengthText = "Good";
      strengthValue = 75;
      strengthColor = "var(--yellow)";
      break;

    case 4:
      strengthText = "Strong";
      strengthValue = 100;
      strengthColor = "var(--green)";
      break;
  }

  progressBar.value = strengthValue;
  progressBar.style.background = `
    linear-gradient(
      to right,
      ${strengthColor} ${strengthValue}%,
      var(--white-100) ${strengthValue}%
    )
  `;

  statusElement.textContent = strengthText;
  statusElement.style.color = strengthColor;
}

function resetPasswordRules(rulesBlock) {
  const ruleItems = rulesBlock.querySelectorAll(".password-rules-item");

  ruleItems.forEach((item) => {
    item.classList.remove("complete");
    item.querySelector(".password-rules-icon-true")?.classList.add("icon-visibility");
    item.querySelector(".password-rules-false")?.classList.remove("icon-visibility");
  });

  const progressBar = rulesBlock.querySelector(".password-rules-progress-bar");
  const statusElement = rulesBlock.querySelector(".password-rules-status");
  progressBar.value = 25;
  progressBar.style.background = "var(--white-100)";
  statusElement.textContent = "Weak";
  statusElement.style.color = "var(--red)";
}

function initializeFormValidation() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const isValid = validateForm(form);

      if (!isValid) {
        event.preventDefault();
      }
    });
  });
}

function validateForm(form) {
  const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
  let isFormValid = true;

  fields.forEach((field) => {
    const fieldValid = validateField(field);

    if (!fieldValid) {
      isFormValid = false;
    }
  });

  return isFormValid;
}

function showFieldError(field, message) {
  field.classList.add("error");
  const fieldGroup = field.closest(".form-input-group");
  if (!fieldGroup) return;
  const existingError = fieldGroup.querySelector(".input-error-message");
  if (existingError) {
    existingError.textContent = message;
    return;
  }
  const errorElement = document.createElement("p");
  errorElement.className = "input-error-message";
  errorElement.textContent = message;
  fieldGroup.appendChild(errorElement);
}

function removeFieldError(field) {
  field.classList.remove("error");
  const fieldGroup = field.closest(".form-input-group");
  if (!fieldGroup) return;
  const errorElement = fieldGroup.querySelector(".input-error-message");
  if (errorElement) {
    errorElement.remove();
  }
}

function validateField(field) {
  const value = field.value.trim();
  if (!value) {
    showFieldError(field, "This field is required");
    return false;
  }
  removeFieldError(field);
  return true;
}

function initializePasswordToggle() {
  const passwordWrappers = document.querySelectorAll(".password-input-wrapper");

  passwordWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("[data-password-input]");
    const toggle = wrapper.querySelector("[data-password-toggle]");

    if (!input || !toggle) return;
    updatePasswordToggleState(input, toggle);
    input.addEventListener("input", () => {
      updatePasswordToggleState(input, toggle);
    });
    toggle.addEventListener("click", () => {
      togglePasswordVisibility(input, toggle);
    });
  });
}

function updatePasswordToggleState(input, toggle) {
  const openEyeIcon = toggle.children[0];
  const closedEyeIcon = toggle.children[1];

  if (!input.value.trim()) {
    toggle.classList.add("disabled");
    input.type = "password";
    openEyeIcon.classList.add("icon-visibility");
    closedEyeIcon.classList.remove("icon-visibility");
    return;
  }
  toggle.classList.remove("disabled");
}

function togglePasswordVisibility(input, toggle) {
  if (!input.value.trim()) return;

  const openEyeIcon = toggle.querySelector(".eye-open-icon");
  const closedEyeIcon = toggle.querySelector(".eye-close-icon");
  const isPasswordHidden = input.type === "password";
  if (isPasswordHidden) {
    input.type = "text";
    openEyeIcon.classList.remove("icon-visibility");
    closedEyeIcon.classList.add("icon-visibility");
  } else {
    input.type = "password";
    openEyeIcon.classList.add("icon-visibility");
    closedEyeIcon.classList.remove("icon-visibility");
  }
}

function initializeErrorCleanup() {
  const fields = document.querySelectorAll("input[required], select[required], textarea[required]");

  fields.forEach((field) => {
    const eventType = field.tagName === "SELECT" ? "change" : "input";

    field.addEventListener(eventType, () => {
      if (field.value.trim()) {
        removeFieldError(field);
      }
    });
  });
}
