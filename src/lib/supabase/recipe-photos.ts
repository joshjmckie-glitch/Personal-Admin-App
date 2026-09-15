import { createClient } from "@/lib/supabase/client";

/** Uploads a recipe photo to the user's folder in the recipe-photos bucket and returns its public URL. */
export async function uploadRecipePhoto(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("recipe-photos").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from("recipe-photos").getPublicUrl(path);
  return publicUrl.publicUrl;
}
