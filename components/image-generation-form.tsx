"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePreview } from "@/components/image-preview";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const IMAGE_SIZES = [
  "1024x1024",
  "512x1024",
  "768x512",
  "768x1024",
  "1024x576",
  "576x1024",
] as const;

const MODELS = ["stabilityai/stable-diffusion-3-5-large"] as const;

export function ImageGenerationForm() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState<(typeof MODELS)[number]>(
    "stabilityai/stable-diffusion-3-5-large"
  );
  const [imageSize, setImageSize] =
    useState<(typeof IMAGE_SIZES)[number]>("1024x1024");
  const [batchSize, setBatchSize] = useState(1);
  const [numInferenceSteps, setNumInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | null>(null);
  const [promptEnhancement, setPromptEnhancement] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          negative_prompt: negativePrompt,
          image_size: imageSize,
          batch_size: batchSize,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          seed: seed || Math.floor(Math.random() * 999999),
          prompt_enhancement: promptEnhancement,
          isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("图片生成失败");
      }

      const { imageUrl } = await response.json();
      setPreviewUrl(imageUrl);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成图片时发生错误");
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium leading-none">
            模型
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) =>
              setModel(e.target.value as (typeof MODELS)[number])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium leading-none">
            图片描述
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="描述您想要生成的图片，例如：一只在月光下奔跑的狼"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="negativePrompt"
            className="text-sm font-medium leading-none"
          >
            负面提示词
          </label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="描述您不想在图片中出现的元素（可选）"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="imageSize"
            className="text-sm font-medium leading-none"
          >
            图片尺寸
          </label>
          <select
            id="imageSize"
            value={imageSize}
            onChange={(e) =>
              setImageSize(e.target.value as (typeof IMAGE_SIZES)[number])
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {IMAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="batchSize"
              className="text-sm font-medium leading-none"
            >
              生成数量 (1-4)
            </label>
            <input
              type="number"
              id="batchSize"
              value={batchSize}
              onChange={(e) =>
                setBatchSize(Math.min(4, Math.max(1, parseInt(e.target.value))))
              }
              min="1"
              max="4"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="numInferenceSteps"
              className="text-sm font-medium leading-none"
            >
              推理步数 (1-50)
            </label>
            <input
              type="number"
              id="numInferenceSteps"
              value={numInferenceSteps}
              onChange={(e) =>
                setNumInferenceSteps(
                  Math.min(50, Math.max(1, parseInt(e.target.value)))
                )
              }
              min="1"
              max="50"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="guidanceScale"
              className="text-sm font-medium leading-none"
            >
              引导系数 (0-20)
            </label>
            <input
              type="number"
              id="guidanceScale"
              value={guidanceScale}
              onChange={(e) =>
                setGuidanceScale(
                  Math.min(20, Math.max(0, parseFloat(e.target.value)))
                )
              }
              step="0.1"
              min="0"
              max="20"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="seed" className="text-sm font-medium leading-none">
              随机种子（可选）
            </label>
            <input
              type="number"
              id="seed"
              value={seed || ""}
              onChange={(e) =>
                setSeed(e.target.value ? parseInt(e.target.value) : null)
              }
              min="0"
              max="9999999999"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="留空随机生成"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="promptEnhancement"
              checked={promptEnhancement}
              onChange={(e) => setPromptEnhancement(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="promptEnhancement"
              className="text-sm font-medium leading-none"
            >
              提示词增强
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={loading}
            />
            <Label htmlFor="public-mode">公开图片</Label>
          </div>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium"
          disabled={loading}
        >
          {loading ? "生成中..." : "生成图片"}
        </button>
      </form>
      <div className="space-y-4 order-first lg:order-none">
        <h2 className="text-lg font-semibold">预览</h2>
        <ImagePreview url={previewUrl} prompt={prompt} generating={loading} />
      </div>
    </div>
  );
}
