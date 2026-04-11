import { uploadImage } from "../api.js";

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  let imageUrl = "";
  let errorMessage = "";
  let isUploading = false;
  const maxImageSizeMb = 10;
  
  const render = () => {
    element.innerHTML = `
      <div class="upload-image">
        ${
          imageUrl
            ? `
            <div class="file-upload-image-container">
              <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
              <button type="button" class="file-upload-remove-button button">Заменить фото</button>
            </div>
            `
            : `
            <label class="file-upload-label secondary-button">
              <input
                type="file"
                class="file-upload-input"
                style="display:none"
                 accept="image/*"
                 ${isUploading ? "disabled" : ""}
              />
             ${isUploading ? "Загружаю файл..." : "Выберите фото"}
            </label>
          `
        }
        ${errorMessage ? `<div class="form-error">${errorMessage}</div>` : ""}
      </div>
    `;

    const fileInputElement = element.querySelector(".file-upload-input");
    fileInputElement?.addEventListener("change", () => {
       if (isUploading) {
        return;
      }
      
      const file = fileInputElement.files[0];
      if (!file) {
        return;
      }

     if (!file.type.startsWith("image/")) {
        errorMessage = "Можно загружать только изображения";
        render();
        return;
      }

      if (file.size > maxImageSizeMb * 1024 * 1024) {
        errorMessage = `Файл слишком большой (максимум ${maxImageSizeMb} МБ)`;
        render();
        return;
      }
      
      errorMessage = "";
     isUploading = true;
      render();
      
      uploadImage({ file })
        .then(({ fileUrl }) => {
          imageUrl = fileUrl;
          onImageUrlChange(imageUrl);
        })
        .catch(() => {
          errorMessage = "Не удалось загрузить изображение";
          })
        .finally(() => {
          isUploading = false;
          render();
        });
    });

    element
      .querySelector(".file-upload-remove-button")
      ?.addEventListener("click", () => {
         imageUrl = "";
        errorMessage = "";
        onImageUrlChange(imageUrl);
        render();
      });
  };

  render();
}
