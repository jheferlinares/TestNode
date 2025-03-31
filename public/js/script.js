const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("account_password");

togglePassword.addEventListener("click", () => {
  // Toggle the type attribute
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle the button text
  togglePassword.textContent = type === "password" ? "Show" : "Hide";
});