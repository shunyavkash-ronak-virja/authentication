document.addEventListener("DOMContentLoaded", () => {
  initializePasswordRules();
  initializeFormValidation();
  initializePasswordToggle();
  initializeErrorCleanup();

  const successButton = document.getElementById("success-popup-btn");
  if (successButton) {
    successButton.addEventListener("click", () => {
      hideSuccessPopup();
      window.location.href = "sign-in.html";
    });
  }
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
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  updateRuleUI(rulesBlock, "length", rules.length);
  updateRuleUI(rulesBlock, "uppercase", rules.uppercase);
  updateRuleUI(rulesBlock, "lowercase", rules.lowercase);
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
      strengthValue = 40;
      strengthColor = "var(--red)";
      break;

    case 3:
      strengthText = "Good";
      strengthValue = 60;
      strengthColor = "var(--orange)";
      break;

    case 4:
      strengthText = "Very Good";
      strengthValue = 80;
      strengthColor = "var(--yellow)";
      break;

    case 5:
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
  const signUpForm = document.querySelector(".sign-up-form");
  if (!signUpForm) return;
  signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateForm(signUpForm);
    if (!isValid) {
      return;
    }
    const isSaved = saveUserData();
    if (!isSaved) {
      return;
    }
    signUpForm.reset();

    const passwordRulesBlocks = document.querySelectorAll(".password-rules-block");
    passwordRulesBlocks.forEach((block) => {
      block.classList.remove("show");
      resetPasswordRules(block);
    });

    showSuccessPopup();
  });
}

function saveUserData() {
  const userData = {
    fullName: document.getElementById("full-name").value.trim(),
    email: document.getElementById("sign-up-email").value.trim(),
    phone: document.getElementById("sign-up-number").value.trim(),
    role: document.getElementById("role-select").value,
    password: document.getElementById("sign-up-password").value,
  };

  let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const emailExists = users.some(
    (user) => user.email.toLowerCase() === userData.email.toLowerCase(),
  );

  if (emailExists) {
    const emailField = document.getElementById("sign-up-email");
    showFieldError(emailField, "Email already registered");
    return false;
  }

  users.push(userData);
  localStorage.setItem("registeredUsers", JSON.stringify(users));
  return true;
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
  const fieldGroup = field.closest(".form-input-group");

  if (!fieldGroup) return;
  field.classList.add("error");
  let errorElement = fieldGroup.querySelector(".input-error-message");
  if (!errorElement) {
    errorElement = document.createElement("p");
    errorElement.classList.add("input-error-message");
    fieldGroup.appendChild(errorElement);
  }

  errorElement.textContent = message;
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
  if (field.id === "sign-up-email") {
    return validateEmail(field);
  }
  if (field.id === "sign-up-number") {
    return validatePhone(field);
  }
  if (field.id === "sign-up-password") {
    return validatePassword(field);
  }
  if (field.id === "confirm-password") {
    return validateConfirmPassword(field);
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

function validatePassword(field) {
  const password = field.value;
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  if (!isValid) {
    showFieldError(field, "Password does not meet all requirements");
    return false;
  }

  removeFieldError(field);
  return true;
}

function validateConfirmPassword(field) {
  const passwordField = document.getElementById("sign-up-password");
  const password = passwordField.value.trim();
  const confirmPassword = field.value.trim();

  if (!confirmPassword) {
    showFieldError(field, "Please confirm your password");
    return false;
  }

  if (password !== confirmPassword) {
    showFieldError(field, "Passwords do not match");
    return false;
  }

  removeFieldError(field);
  return true;
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

  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordInput = document.getElementById("sign-up-password");

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      validateConfirmPassword(confirmPasswordInput);
    });
  }

  if (passwordInput && confirmPasswordInput) {
    passwordInput.addEventListener("input", () => {
      if (confirmPasswordInput.value.trim()) {
        validateConfirmPassword(confirmPasswordInput);
      }
    });
  }
}

// -------
// Phone validation function
// -------
const phoneInput = document.getElementById("sign-up-number");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });
}

function validatePhone(field) {
  const phone = field.value.trim();
  if (phone.length !== 10) {
    showFieldError(field, "Phone number must be 10 digits");
    return false;
  }
  removeFieldError(field);
  return true;
}

// -------
// Email validation function
// -------
function validateEmail(field) {
  const email = field.value.trim();

  if (!email) {
    showFieldError(field, "This field is required");
    return false;
  }
  if (!isValidEmail(email)) {
    showFieldError(field, "Please enter a valid email address");
    return false;
  }

  removeFieldError(field);
  return true;
}

function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|in)$/;
  return emailPattern.test(email);
}

// -------
// Success Popup
// -------
function showSuccessPopup() {
  const popup = document.getElementById("success-popup");
  if (!popup) return;
  popup.classList.add("show");
}
function hideSuccessPopup() {
  const popup = document.getElementById("success-popup");
  if (!popup) return;
  popup.classList.remove("show");
}

// -------
// Main Page Dynamic Username
// -------
document.addEventListener("DOMContentLoaded", () => {
  const userName = document.getElementById("user-name");
  const userData = JSON.parse(localStorage.getItem("currentUser"));

  if (userName && userData) {
    userName.textContent = userData.fullName;
  }
});

// -------
// Login Validation Function
// -------
function validateLogin(email, password) {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return {
      success: false,
      field: "email",
      message: "Email not found",
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      field: "password",
      message: "Incorrect password",
    };
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  return {
    success: true,
  };
}

// -------
// Login Session Function
// -------
function createLoginSession(rememberMe) {
  const sessionData = {
    isLoggedIn: true,
    loginTime: Date.now(),
    rememberMe,
  };
  localStorage.setItem("loginSession", JSON.stringify(sessionData));
}

// -------
// Sign In Submit Event
// -------
const signInForm = document.querySelector(".sign-in-form");
if (signInForm) {
  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("sign-in-email").value.trim();
    const password = document.getElementById("sign-in-password").value.trim();
    const rememberCheckbox = document.getElementById("remember-me-option");

    if (!rememberCheckbox.checked) {
      showFieldError(rememberCheckbox, "Please check Remember me before signing in");
      return;
    }
    removeFieldError(rememberCheckbox);
    const loginResult = validateLogin(email, password);
    if (!loginResult.success) {
      if (loginResult.field === "email") {
        showFieldError(document.getElementById("sign-in-email"), loginResult.message);
      }
      if (loginResult.field === "password") {
        showFieldError(document.getElementById("sign-in-password"), loginResult.message);
      }
      return;
    }
    createLoginSession(rememberCheckbox.checked);

    window.location.href = "main.html";
  });
}
