import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
   
  const render = () => {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
<div class="form fade-in">
        <h3 class="form-title">Добавление поста</h3>
        <div class="form-inputs">
          <div class="upload-image-container"></div>
           <textarea id="description-input" class="input" placeholder="Описание" rows="4" maxlength="280"></textarea>
          <div class="post-form-footer">
            <span id="description-counter" class="post-counter">0 / 280</span>
            <span id="post-form-error" class="form-error"></span>
          </div>
          <button class="button" id="add-button">Добавить</button>
        </div>
      </div>
    </div>
  `;

    appEl.innerHTML = appHtml;
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

      const descriptionInput = document.getElementById("description-input");
    const descriptionCounter = document.getElementById("description-counter");
    const addButton = document.getElementById("add-button");
    const setError = (message) => {
      document.getElementById("post-form-error").textContent = message;
    };

    descriptionInput.addEventListener("input", () => {
      descriptionCounter.textContent = `${descriptionInput.value.length} / 280`;
    });

    addButton.addEventListener("click", () => {
      setError("");
       
       const description = descriptionInput.value.trim();
      if (!description) {
      setError("Введите описание поста");
        return;
      }

      if (!imageUrl) {
       setError("Добавьте фотографию");
        return;
      }
       
     addButton.disabled = true;
      onAddPostClick({
      description,
        imageUrl,
      });
    });
  };

  render();
}
