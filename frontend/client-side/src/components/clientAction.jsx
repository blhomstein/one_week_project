import { register, login } from "../lib/services.js";
export async function clientAction({ request }) {
  try {
    const formData = await request.formData();
    const type = formData.get("type");
    const email = formData.get("email");
    const password = formData.get("password");

    const response =
      type === "register"
        ? await register({ email, password })
        : await login({ email, password });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return redirect("/");
  } catch (error) {
    return {
      error: error?.response?.data?.message || error.message,
    };
  }
}
