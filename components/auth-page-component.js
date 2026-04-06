import { loginUser, registerUser } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";


export function renderAuthPageComponent({ appEl, setUser }) {
 
  let isLoginMode = true;

  
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
              <div class="form-inputs">
                  ${
                    !isLoginMode
                      ? `
                      <div class="upload-image-container"></div>
                      <input type="text" id="name-input" class="input" placeholder="Имя" />
                      `
                      : ""
                  }
                  <input type="text" id="login-input" class="input" placeholder="Логин" />
                  <input type="password" id="password-input" class="input" placeholder="Пароль" />
                 <div class="form-error" role="alert"></div>
                  <button class="button" id="login-button">${
                    isLoginMode ? "Войти" : "Зарегистрироваться"
                  }</button>
              </div>
              <div class="form-footer">
                <p class="form-footer-title">
                  ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                  <button class="link-button" id="toggle-button">
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

    document.getElementById("login-button").addEventListener("click", () => {
      setError("");
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
        submitButton.disabled = false;
        setError(validationError);
        return;
      }

      if (!name || !normalizedLogin || !normalizedPassword) {
        submitButton.disabled = false;
        setError("Заполните все поля регистрации");
        return;
      }
     
      if (name.length < 2) {
        submitButton.disabled = false;
        setError("Имя должно быть не короче 2 символов");
        return;
      }

        if (!imageUrl) {
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
          submitButton.disabled = false;
        });
    });

    document.getElementById("toggle-button").addEventListener("click", () => {
      isLoginMode = !isLoginMode;
      imageUrl = "";
      renderForm();
    });
  };

  renderForm();
}
