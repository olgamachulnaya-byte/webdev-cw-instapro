// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "instapro-cw-2026";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `https://wedev-api.sky.pro/api/v1/${personalKey}/instapro`;
const getJson = (response) => {
  if (response.status === 401) {
    throw new Error("Нет авторизации");
  }

  if (!response.ok) {
    return response
      .json()
      .then((errorData) => {
        throw new Error(errorData.error || "Ошибка API");
      })
      .catch(() => {
        throw new Error("Ошибка API");
      });
  }

  return response.json();
};
const jsonHeaders = {
  "Content-Type": "application/json",
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
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
  
   return getJson(response);
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
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }

    return getJson(response);
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
