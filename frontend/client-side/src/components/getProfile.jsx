import { getProfile } from "@/lib/services";

export async function clientLoader() {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return redirect("/auth/login");
    }

    const { data } = await getProfile();

    return { profile: data };
  } catch {
    localStorage.removeItem("accessToken");
    return redirect("/auth/login");
  }
}
