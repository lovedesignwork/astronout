import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Language } from '@/types';

// Verify admin authentication
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return { authorized: false, error: 'Unauthorized' };
  }

  return { authorized: true };
}

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  ru: 'Russian',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  id: 'Indonesian',
};

interface TranslationRequest {
  texts: Array<{ key: string; en: string }>;
  targetLanguages?: Language[];
}

// POST - Translate texts using OpenAI
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const body: TranslationRequest = await request.json();
    const { texts, targetLanguages = ['zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'] } = body;

    if (!texts || texts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Texts array is required' },
        { status: 400 }
      );
    }

    // Filter out English from target languages
    const langsToTranslate = targetLanguages.filter(l => l !== 'en') as Language[];
    
    if (langsToTranslate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No target languages specified' },
        { status: 400 }
      );
    }

    // Build the translation prompt
    const textsObj: Record<string, string> = {};
    texts.forEach(t => {
      textsObj[t.key] = t.en;
    });

    const translations: Record<string, Record<string, string>> = {};
    
    // Translate to each language
    for (const lang of langsToTranslate) {
      const langName = LANGUAGE_NAMES[lang];
      
      const prompt = `You are a professional translator. Translate the following UI text strings from English to ${langName}.
      
IMPORTANT RULES:
1. Keep translations concise and natural for UI elements (buttons, labels, short messages)
2. Maintain the same tone and formality level as the English text
3. Do not add or remove any keys
4. Return ONLY a valid JSON object with the exact same keys

Input JSON:
${JSON.stringify(textsObj, null, 2)}

Return ONLY the translated JSON object, no explanation:`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator specializing in UI/UX text localization. Always return valid JSON only.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`OpenAI API error for ${lang}:`, errorData);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (content) {
          // Parse the JSON response
          try {
            // Remove markdown code blocks if present
            const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanedContent);
            translations[lang] = parsed;
          } catch (parseError) {
            console.error(`Failed to parse OpenAI response for ${lang}:`, parseError);
          }
        }
      } catch (error) {
        console.error(`Translation error for ${lang}:`, error);
      }
    }

    // Restructure by key for easier consumption
    const result: Record<string, Record<string, string>> = {};
    texts.forEach(t => {
      result[t.key] = { en: t.en };
      langsToTranslate.forEach(lang => {
        if (translations[lang]?.[t.key]) {
          result[t.key][lang] = translations[lang][t.key];
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      translations: result,
      translatedLanguages: Object.keys(translations),
    });
  } catch (error) {
    console.error('Error in AI translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to translate texts' }, { status: 500 });
  }
}




