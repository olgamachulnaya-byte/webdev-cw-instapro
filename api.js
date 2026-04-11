// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "instapro-cw-2026";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;
const NETWORK_ERROR_MESSAGE = "Проблема сети, попробуйте позже";
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
const request = (url, options = {}) => {
  const { json, headers, ...restOptions } = options;
  const preparedOptions = {
    ...restOptions,
    ...(headers ? { headers: { ...headers } } : {}),
  };

  if (json !== undefined) {
    preparedOptions.body =
      typeof json === "string" ? json : JSON.stringify(json);
  }

  return fetch(url, preparedOptions).catch((error) => {
    if (error instanceof TypeError) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    throw error;
  });
};

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const validateAuthPayload = ({ login, password, requireName = false, name = "" }) => {
  const normalizedLogin = normalizeString(login);
  const normalizedPassword = typeof password === "string" ? password : "";
  const normalizedName = normalizeString(name);

  if (!normalizedLogin || !normalizedPassword || (requireName && !normalizedName)) {
    throw new Error("Заполните обязательные поля");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(normalizedLogin)) {
    throw new Error("Логин может содержать только латинские буквы, цифры и _");
  }

  if (normalizedPassword.length < 6) {
    throw new Error("Пароль должен быть не короче 6 символов");
  }

  if (requireName && normalizedName.length < 2) {
    throw new Error("Имя должно быть не короче 2 символов");
  }

  return {
    login: normalizedLogin,
    password: normalizedPassword,
    ...(requireName ? { name: normalizedName } : {}),
  };
};

const isDuplicateUserError = (message = "") => {
  const normalized = message.toLowerCase();

  return (
   (normalized.includes("пользователь") || normalized.includes("user")) &&
    (normalized.includes("существует") ||
      normalized.includes("already exists") ||
      normalized.includes("already exist"))
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
  return request(postsHost, {
    method: "GET",
    headers: {
       ...(token ? { Authorization: token } : {}),
    },
  })
   .then(getJson)
    .then((data) => data.posts);
}

export function getUserPosts({ userId, token }) {
  return request(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
     ...(token ? { Authorization: token } : {}),
    },
  })
    .then(getJson)
   
    .then((data) => data.posts);
  
}

export function addPost({ description, imageUrl, token }) {
  const normalizedDescription = normalizeString(description);
  const normalizedImageUrl = normalizeString(imageUrl);

  if (!normalizedDescription) {
    return Promise.reject(new Error("Введите описание поста"));
  }

  if (!normalizedImageUrl) {
    return Promise.reject(new Error("Добавьте фотографию"));
  }
  return request(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
     json: {
      description: normalizedDescription,
      imageUrl: normalizedImageUrl,
    },
  }).then(getJson);
}

export function likePost({ postId, token }) {
 return request(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then(getJson)
    .then((data) => data.post);
}

export function dislikePost({ postId, token }) {
   return request(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then(getJson)
    .then((data) => data.post);
}

export function registerUser({ login, password, name, imageUrl }) {
  const validatedAuth = validateAuthPayload({
    login,
    password,
    requireName: true,
    name,
  });
  const normalizedImageUrl = normalizeString(imageUrl);

  if (!normalizedImageUrl) {
    return Promise.reject(new Error("Добавьте фото профиля"));
  }
  
  return request(baseHost + "/api/user", {
    method: "POST",
    json: {
      login: validatedAuth.login,
      password: validatedAuth.password,
      name: validatedAuth.name,
      imageUrl: normalizedImageUrl,
     },
    })
    .then(getJson)
    .catch((error) => {
      if (isDuplicateUserError(error.message)) {
        throw new Error("Такой пользователь уже существует");
      }

      if (isBadRequestError(error.message)) {
        throw new Error(
          "Некорректные данные регистрации. Логин: латиница/цифры/_, пароль: от 6 символов, имя: от 2 символов, фото профиля: обязательное поле.",
        );
      }

      throw error;
    });
}

export function loginUser({ login, password }) {
  const validatedAuth = validateAuthPayload({ login, password });
  
  return request(baseHost + "/api/user/login", {
    method: "POST",
    json: {
      login: validatedAuth.login,
      password: validatedAuth.password,
    },
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

  return request(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
   }).then(getJson);
}
