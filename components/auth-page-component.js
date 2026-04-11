import { loginUser, registerUser } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";


export function renderAuthPageComponent({ appEl, setUser }) {
 
  let isLoginMode = true;
  let isSubmitting = false;

  
  let imageUrl = "";

  
  const renderForm = () => {
   const validateCredentials = ({ login, password, isRegistration }) => {
      if (!login || !password) {
        return "Введите логин и пароль";
      }

      if (login.includes(" ")) {
        return "Логин не должен содержать пробелы";
      }

      if (login.length < 3) {
        return "Логин должен быть не короче 3 символов";
      }

    if (!/^[a-zA-Z0-9_]+$/.test(login)) {
        return "Логин может содержать только латинские буквы, цифры и _";
      }

    
      if (password.length < 6) {
        return "Пароль должен быть не короче 6 символов";
      }

      if (isRegistration && password.length > 30) {
        return "Пароль слишком длинный";
      }

      return "";
    };
    const appHtml = `
      <div class="page-container">
          <div class="header-container"></div>
          <div class="form fade-in">
              <h3 class="form-title">
                ${
                  isLoginMode
                    ? "Вход в&nbsp;Instapro"
                    : "Регистрация в&nbsp;Instapro"
                }
              </h3>
              <form class="form-inputs" id="auth-form">
                  ${
                    !isLoginMode
                      ? `
                      <div class="upload-image-container"></div>
                      <input type="text" id="name-input" class="input" placeholder="Имя" autocomplete="name" />
                      `
                      : ""
                  }
                 <input type="text" id="login-input" class="input" placeholder="Логин" autocomplete="username" form="auth-form" />
                  <input type="password" id="password-input" class="input" placeholder="Пароль" autocomplete="${isLoginMode ? "current-password" : "new-password"}" form="auth-form" />
                 <div class="form-error" role="alert"></div>
                  <button class="button" id="login-button" type="submit">${
                    isLoginMode ? "Войти" : "Зарегистрироваться"
                  }</button>
              </form>
              <div class="form-footer">
                <p class="form-footer-title">
                  ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                  <button class="link-button" id="toggle-button" type="button">
                    ${isLoginMode ? "Зарегистрироваться." : "Войти."}
                  </button>
                </p>
              </div>
          </div>
         </div> 
    `;

    appEl.innerHTML = appHtml;

   const submitButton = appEl.querySelector("#login-button");
    const setError = (message) => {
      appEl.querySelector(".form-error").textContent = message;
    };

   
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    if (uploadImageContainer) {
      renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange(newImageUrl) {
          imageUrl = newImageUrl;
        },
      });
    }

      document.getElementById("auth-form").addEventListener("submit", (event) => {
      event.preventDefault();
       
     if (isSubmitting) {
        return;
      }
     
      setError("");
      isSubmitting = true;
      submitButton.disabled = true;

    const login = document.getElementById("login-input").value;
      const password = document.getElementById("password-input").value;
      const normalizedLogin = login.trim();
      const normalizedPassword = password;

        if (isLoginMode) {
         const validationError = validateCredentials({
            login: normalizedLogin,
            password: normalizedPassword,
            isRegistration: false,
          });

          if (validationError) {
            isSubmitting = false;
            submitButton.disabled = false;
            setError(validationError);
            return;
          }

        loginUser({ login: normalizedLogin, password: normalizedPassword })
          .then((newUser) => {
            setUser(newUser.user);
          })
          .catch((error) => {
            setError(error.message);
            })
          .finally(() => {
            isSubmitting = false;
            submitButton.disabled = false;
          });
    
       return;
      }

      const name = document.getElementById("name-input").value.trim();
      const validationError = validateCredentials({
        login: normalizedLogin,
        password: normalizedPassword,
        isRegistration: true,
      });

      if (validationError) {
        isSubmitting = false;
        submitButton.disabled = false;
        setError(validationError);
        return;
      }

      if (!name || !normalizedLogin || !normalizedPassword) {
        isSubmitting = false;
        submitButton.disabled = false;
        setError("Заполните все поля регистрации");
        return;
      }
     
      if (name.length < 2) {
        isSubmitting = false;
        submitButton.disabled = false;
        setError("Имя должно быть не короче 2 символов");
        return;
      }

        if (!imageUrl) {
        isSubmitting = false;
        submitButton.disabled = false;
        setError("Добавьте фото профиля");
        return;
      }
        registerUser({
          login: normalizedLogin,
           password: normalizedPassword,
          name,
          imageUrl,
        })
        .then((newUser) => {
          setUser(newUser.user);
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(() => {
          isSubmitting = false;
          submitButton.disabled = false;
        });
    });

    document.getElementById("toggle-button").addEventListener("click", () => {
      isLoginMode = !isLoginMode;
      isSubmitting = false;
      imageUrl = "";
      renderForm();
    });
  };

  renderForm();
}
