import { ImageGenerationForm } from "@/components/image-generation-form";
import { GenerationHistory } from "@/components/generation-history";

export default function CreatePage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">创建图片</h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              输入您想要生成的图片描述，让AI为您创作独特的图片。提示：描述越详细，生成的图片效果越好。
            </p>
          </div>
          <ImageGenerationForm />
        </div>
        <GenerationHistory />
      </div>
    </div>
  );
}
