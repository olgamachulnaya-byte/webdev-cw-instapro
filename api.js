// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "instapro-cw-2026";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `https://wedev-api.sky.pro/api/v1/${personalKey}/instapro`;
const getJson = (response) => {
  if (response.status === 401) {
    throw new Error("Нет авторизации");
  }

  if (!response.ok) {
    return response.json().then(
      (errorData) => {
        throw new Error(errorData.error || "Ошибка API");
      },
      () => {
        throw new Error("Ошибка API");
      },
    );
  }

  return response.json();
};
const jsonHeaders = {
  "Content-Type": "application/json",
};

const isDuplicateUserError = (message = "") => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("пользователь") &&
    (normalized.includes("существует") || normalized.includes("already exists"))
  );
};

const isInvalidCredentialsError = (message = "") => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("невер") ||
    normalized.includes("неправ") ||
    normalized.includes("не найден") ||
    normalized.includes("invalid") ||
    normalized.includes("not found")
  );
};

const isBadRequestError = (message = "") => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("400") ||
    normalized.includes("bad request") ||
    normalized.includes("невалид") ||
    normalized.includes("некоррект")
  );
};

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
       ...(token ? { Authorization: token } : {}),
    },
  })
   .then(getJson)
    .then((data) => data.posts);
}

export function getUserPosts({ userId, token }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
     ...(token ? { Authorization: token } : {}),
    },
  })
    .then(getJson)
   
    .then((data) => data.posts);
  
}

export function addPost({ description, imageUrl, token }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
       ...jsonHeaders,
      Authorization: token,
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  }).then(getJson);
}

export function likePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then(getJson)
    .then((data) => data.post);
}

export function dislikePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then(getJson)
    .then((data) => data.post);
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
    })
    .then(getJson)
    .catch((error) => {
      if (isDuplicateUserError(error.message)) {
        throw new Error("Такой пользователь уже существует");
      }

      if (isBadRequestError(error.message)) {
        throw new Error(
          "Некорректные данные регистрации. Проверьте логин, пароль, имя и фото профиля.",
        );
      }

      throw error;
    });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      login,
      password,
    }),
 })
    .then(getJson)
    .catch((error) => {
      if (isInvalidCredentialsError(error.message)) {
        throw new Error("Неверный логин или пароль");
      }

   if (isBadRequestError(error.message)) {
        throw new Error(
          "Некорректный формат данных для входа. Проверьте логин и пароль.",
        );
      }

      throw error;
    });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
   }).then(getJson);
}
