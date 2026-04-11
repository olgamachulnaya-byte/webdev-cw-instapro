import { USER_POSTS_PAGE, POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { escapeHtml } from "../helpers.js";

const formatCreatedAt = (createdAt) => {
  const createdAtDate = new Date(createdAt);
  const diffInMinutes = Math.floor((Date.now() - createdAtDate.getTime()) / 60000);

  if (diffInMinutes < 1) {
    return "только что";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} минут назад`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} часов назад`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} дней назад`;
};

export function renderPostsPageComponent({ appEl, onLikeClick, pageTitle = "" }) {
  const postsHtml = posts
    .map((post) => {
      const likesCount = post.likes?.length || 0;
      const likeImageSrc = post.isLiked
        ? "./assets/images/like-active.svg"
        : "./assets/images/like-not-active.svg";

        const userId = post.user?.id ?? "";

      return `<li class="post fade-in">
          <div class="post-header" data-user-id="${userId}">
              <img src="${post.user.imageUrl}" class="post-header__user-image" alt="Аватар ${escapeHtml(
        post.user.name,
      )}">
              <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}" alt="Публикация ${escapeHtml(post.user.name)}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button" ${
        user ? "" : "disabled title=\"Лайки доступны после входа\""
      }>
              <img src="${likeImageSrc}" alt="Лайк">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${likesCount}</strong>
            </p>
          </div>
          <p class="post-text">
           <span class="user-name">${escapeHtml(post.user.name)}</span>
            ${escapeHtml(post.description)}
          </p>
          <p class="post-date">
            ${formatCreatedAt(post.createdAt)}
          </p>
        </li>`;
    })
    .join("");
  
const backButtonHtml = pageTitle
    ? '<button class="secondary-button feed-back-button" id="back-to-feed-button">← В общую ленту</button>'
    : "";
  
  const appHtml = `
       <div class="page-container">
      <div class="header-container"></div>
       ${pageTitle ? `<h2 class="feed-title">${escapeHtml(pageTitle)}</h2>` : ""}
      ${backButtonHtml}
      ${postsHtml ? `<ul class="posts">${postsHtml}</ul>` : '<p class="empty-feed">Пока нет публикаций.</p>'}
    </div>`;       

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

 appEl.querySelector("#back-to-feed-button")?.addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  for (const userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
         const userId = userEl.dataset.userId?.trim();
      if (!userId || userId === "undefined" || userId === "null") {
        return;
      }
      
      goToPage(USER_POSTS_PAGE, {
        userId,
      });
    });
  }
  
  if (!user) {
    return;
  }

  for (const likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
     likeButton.disabled = true;
      likeButton.classList.add("like-button_loading");

      onLikeClick?.(likeButton.dataset.postId)
        ?.catch(() => {
          // Ошибка уже обрабатывается на уровне страницы.
        })
        .finally(() => {
          likeButton.disabled = false;
          likeButton.classList.remove("like-button_loading");
          likeButton.classList.add("like-button_pulse");
          setTimeout(() => likeButton.classList.remove("like-button_pulse"), 250);
        });
    });
  }
}
