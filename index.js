import {
  addPost,
  dislikePost,
  getPosts,
  getUserPosts,
  likePost,
} from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

const getValidatedStoredUser = () => {
  const storedUser = getUserFromLocalStorage();

  if (storedUser && typeof storedUser.token === "string" && storedUser.token.trim()) {
    return storedUser;
  }

  if (storedUser) {
    removeUserFromLocalStorage();
  }

  return null;
};

export let user = getValidatedStoredUser();
export let page = null;
export let posts = [];
let currentUserPostsPageUserId = null;

const getToken = () =>
  user && typeof user.token === "string" && user.token.trim()
    ? `Bearer ${user.token}`
    : undefined;

const toggleLike = ({ postId }) => {
  const selectedPost = posts.find((post) => post.id === postId);
  if (!selectedPost || !user) {
    return Promise.resolve();
  }

  const request = selectedPost.isLiked ? dislikePost : likePost;

  return request({ postId, token: getToken() }).then((updatedPost) => {
    posts = posts.map((post) => (post.id === postId ? updatedPost : post));
    renderApp();
  });
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      currentUserPostsPageUserId = null;
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          alert("Не удалось загрузить посты. Попробуйте позже.");
          page = POSTS_PAGE;
          posts = [];
          renderApp();
        });
    }

    if (newPage === USER_POSTS_PAGE) {
        if (!data?.userId) {
        console.error("USER_POSTS_PAGE requires data.userId");
        return goToPage(POSTS_PAGE);
      }
      
      currentUserPostsPageUserId = data.userId;
      page = LOADING_PAGE;
      renderApp();

      return getUserPosts({ userId: data.userId, token: getToken() })
        .then((newPosts) => {
          page = USER_POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
           alert("Не удалось загрузить ленту пользователя.");
          goToPage(POSTS_PAGE);
        });
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  
  if (page === LOADING_PAGE) {
   return renderLoadingPageComponent({ appEl, user, goToPage });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
          addPost({
          description,
          imageUrl,
          token: getToken(),
        })
         .then(() => getPosts({ token: getToken() }))
          .then((newPosts) => {
            posts = newPosts;
            page = POSTS_PAGE;
            renderApp();
          })
          .catch((error) => {
            console.error(error);
            alert(error.message);
            page = ADD_POSTS_PAGE;
            renderApp();
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    onLikeClick: (postId) => toggleLike({ postId }),
    });
  }

  if (page === USER_POSTS_PAGE) {
     const pageTitle =
      posts.length > 0
        ? `Посты пользователя ${posts[0].user.name}`
        : "Посты пользователя";

    return renderPostsPageComponent({
      appEl,
      onLikeClick: (postId) =>
        toggleLike({ postId }).then(() => {
          return getUserPosts({
            userId: currentUserPostsPageUserId,
            token: getToken(),
          }).then((newPosts) => {
            posts = newPosts;
            renderApp();
          });
        }),
      pageTitle,
    });
  }
};

goToPage(POSTS_PAGE);
