import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      prompt,
      model,
      negative_prompt,
      image_size,
      batch_size,
      num_inference_steps,
      guidance_scale,
      seed,
      prompt_enhancement,
      isPublic = true,
    } = await request.json();

    console.log("Request payload:", {
      prompt,
      model,
      negative_prompt,
      image_size,
      batch_size,
      num_inference_steps,
      guidance_scale,
      seed,
      prompt_enhancement,
      isPublic,
    });

    // 调用AI图片生成API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/images/generations`;
    console.log("API URL:", apiUrl);

    const requestBody = {
      model: "stabilityai/stable-diffusion-3-5-large",
      prompt,
      negative_prompt: "",
      image_size: "1024x1024",
      batch_size: 1,
      seed: Math.floor(Math.random() * 999999),
      num_inference_steps: 20,
      guidance_scale: 8.0,
      prompt_enhancement: true,
    };
    console.log("Request body:", requestBody);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to generate image: ${errorText}`);
    }

    const data = await response.json();
    console.log("API Success Response:", data);

    const aiImageUrl = data.data[0].url;

    // 下载AI生成的图片
    const imageResponse = await fetch(aiImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image");
    }

    const imageBlob = await imageResponse.blob();

    // 生成唯一的文件名
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}.png`;

    // 上传到Supabase存储
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filename, imageBlob, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // 获取公开访问URL
    const { data: publicUrl } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    // 保存图片记录到数据库
    const { error: dbError } = await supabase.from("images").insert({
      user_id: user.id,
      prompt,
      style: model,
      url: publicUrl.publicUrl,
      is_public: isPublic,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    return NextResponse.json({ imageUrl: publicUrl.publicUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
