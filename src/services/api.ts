import AsyncStorage from
"@react-native-async-storage/async-storage";

const BASE_URL =
process.env.EXPO_PUBLIC_BACKEND_URL;

// =========================
// TOKEN STORAGE
// =========================

export const setToken =
async (
  token: string | null
) => {

  if (token) {

    await AsyncStorage.setItem(
      "token",
      token
    );

  } else {

    await AsyncStorage.removeItem(
      "token"
    );
  }
};

export const getToken =
async () => {

  return AsyncStorage.getItem(
    "token"
  );
};

// =========================
// API REQUEST
// =========================

async function request(
  endpoint: string,
  options: RequestInit = {}
) {

  const token =
    await getToken();

  console.log(
    "API URL:",
    `${BASE_URL}${endpoint}`
  );

  const res = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const data =
    await res.json();

  if (!res.ok) {

    throw new Error(
      data.message ||
      "API Error"
    );
  }

  return data;
}

// =========================
// API METHODS
// =========================

export const api = {

  register: (
    name: string,
    email: string,
    password: string
  ) =>

    request(
      "/api/auth/register",
      {
        method: "POST",

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    ),

  login: (
    email: string,
    password: string
  ) =>

    request(
      "/api/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    ),

  me: () =>

    request(
      "/api/auth/me"
    ),
};