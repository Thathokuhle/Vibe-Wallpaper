
export interface GeneratedImage {
  base64: string;
  prompt: string;
}

export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:3" | "3:4";

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "9:16", label: "Phone (9:16)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
];
