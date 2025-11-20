import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export type QualitySetting = 'quick' | 'standard' | 'high' | 'archival';

const PROMPTS: Record<QualitySetting, string> = {
  quick: `Perform a quick restoration on this photograph. Focus on basic color correction and removing the most obvious dust and scratches. Prioritize speed over fine detail. The goal is a fast, noticeable improvement. Do not add or remove any objects. Only return the enhanced image.`,
  standard: `Restore this old, faded, and slightly damaged photograph. Your task is to perform the following actions:
1.  **Color Correction:** Enhance faded colors to make them vibrant and natural, as they might have looked originally.
2.  **Sharpness Improvement:** Increase the sharpness and clarity of the image, bringing details back into focus.
3.  **Damage Repair:** Fix minor scratches, dust spots, and blemishes on the photograph.
4.  **Noise Reduction:** Reduce film grain and digital noise without losing important details.
The final output should look like a high-quality, modern scan of a well-preserved original photo, while retaining its authentic character. Do not add or remove any objects. Only return the enhanced image.`,
  high: `Perform an expert-level restoration of this old, faded, and damaged photograph. Your goal is to achieve a result worthy of a professional photo archive. Execute the following steps with maximum precision:
1.  **Advanced Color Restoration:** Analyze the remaining color information to reconstruct a full, rich, and historically accurate color palette. Correct color casts and restore subtle gradients.
2.  **Fine Detail Recovery:** Intelligently sharpen the image to recover fine details in faces, textures, and backgrounds that have been lost to blur or fading.
3.  **Meticulous Damage Repair:** Seamlessly repair all visible damage, including significant scratches, tears, creases, stains, and dust spots. The repairs should be undetectable.
4.  **Sophisticated Noise & Grain Reduction:** Apply adaptive noise reduction to minimize film grain and sensor noise while preserving critical edge details and textures. Avoid an overly smooth, digital look.
The final output must be a pristine, high-resolution version of the photograph that honors the original's composition and era. Do not add or remove any elements. Return only the restored image.`,
  archival: `Execute a museum-grade, archival-quality restoration of this photograph. This is the highest level of restoration, intended for preserving a critical historical or personal artifact. Every detail matters.
1.  **Forensic Color Reconstruction:** Go beyond simple correction. Reconstruct colors based on historical pigment analysis for the era, ensuring maximum authenticity. Restore micro-contrast and tonal range with extreme fidelity.
2.  **Ultimate Detail Extraction:** Use advanced deconvolution and sharpening techniques to extract every possible detail from the source image, resolving textures and patterns that are barely visible.
3.  **Flawless Damage Reconstruction:** Reconstruct missing or heavily damaged areas by analyzing surrounding textures and patterns. This includes repairing tears, water damage, and severe fading with seamless, invisible results.
4.  **Professional Noise Management:** Apply multi-stage noise reduction that differentiates between film grain and unwanted noise, preserving the original texture while eliminating artifacts.
The result should be indistinguishable from a perfectly preserved print scanned with state-of-the-art equipment. Do not add or remove elements. Return only the restored image.`
};


export const enhancePhoto = async (base64ImageData: string, mimeType: string, quality: QualitySetting): Promise<string> => {
    try {
        const prompt = PROMPTS[quality];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];

        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }

        throw new Error("ИИ не вернул допустимое изображение. Пожалуйста, попробуйте еще раз.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Сервис ИИ не смог обработать изображение. Проверьте ваше соединение или попробуйте позже.");
    }
};