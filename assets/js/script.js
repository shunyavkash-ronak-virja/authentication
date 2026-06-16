const passwordInput = document.querySelector("#sign-up-password");
const passwordRulesBlock = document.querySelector(".password-rules-block");
const progressBar = document.querySelector(".password-rules-progress-bar");
const statusText = document.querySelector(".password-rules-status");

const lengthRule = document.querySelector("#rule-length");
const uppercaseRule = document.querySelector("#rule-uppercase");
const numberRule = document.querySelector("#rule-number");
const specialRule = document.querySelector("#rule-special");

passwordRulesBlock.style.display = "none";

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;

  if (password.length > 0) {
    passwordRulesBlock.style.display = "flex";
  } else {
    passwordRulesBlock.style.display = "none";
    return;
  }

  let completedRules = 0;

  // Length
  if (password.length >= 8) {
    lengthRule.classList.add("complete");
    completedRules++;
  } else {
    lengthRule.classList.remove("complete");
  }

  // Uppercase
  if (/[A-Z]/.test(password)) {
    uppercaseRule.classList.add("complete");
    completedRules++;
  } else {
    uppercaseRule.classList.remove("complete");
  }

  // Number
  if (/[0-9]/.test(password)) {
    numberRule.classList.add("complete");
    completedRules++;
  } else {
    numberRule.classList.remove("complete");
  }

  // Special Character
  if (/[^A-Za-z0-9]/.test(password)) {
    specialRule.classList.add("complete");
    completedRules++;
  } else {
    specialRule.classList.remove("complete");
  }

  updateStrength(completedRules);
});

function updateStrength(score) {
  const percentage = score * 25;

  progressBar.value = percentage;

  let color = "var(--white-100)";
  let status = "";

  if (score === 1) {
    color = "var(--red)";
    status = "Weak";
  }

  if (score === 2) {
    color = "var(--orange)";
    status = "Fair";
  }

  if (score === 3) {
    color = "var(--yellow)";
    status = "Good";
  }
  if (score === 4) {
    color = "var(--green)";
    status = "Strong";
  }
  statusText.textContent = status;
  progressBar.style.background = `
    linear-gradient(
      to right,
      ${color} ${percentage}%,
      var(--white-100) ${percentage}%
    )
  `;
}

const form = document.querySelector(".sign-up-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;

  const inputs = form.querySelectorAll("input[required], select[required]");

  inputs.forEach((input) => {
    input.classList.remove("error");

    if (!input.value.trim()) {
      input.classList.add("error");
      isValid = false;
    }
  });

  const password = passwordInput.value;

  const validPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!validPassword) {
    passwordInput.classList.add("error");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  alert("Form Submitted Successfully");
});

function showError(input, message) {
  removeError(input);

  const error = document.createElement("p");
  error.className = "input-error-message";
  error.textContent = message;

  input.classList.add("error");
  input.parentElement.append(error);
}

function removeError(input) {
  const error = input.parentElement.querySelector(".input-error-message");

  if (error) error.remove();

  input.classList.remove("error");
}
