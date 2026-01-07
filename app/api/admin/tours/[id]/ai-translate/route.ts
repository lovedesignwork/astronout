import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
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

interface TranslateContentRequest {
  // For simple text fields
  text?: string;
  fieldName?: string;
  
  // For block content
  blockId?: string;
  content?: Record<string, unknown>;
  
  // Options
  targetLanguages?: Language[];
  saveToDatabase?: boolean;
}

// POST - Translate tour content using OpenAI
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: tourId } = await params;
    const body: TranslateContentRequest = await request.json();
    const { 
      text, 
      fieldName,
      blockId, 
      content,
      targetLanguages = ['zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'],
      saveToDatabase = false 
    } = body;

    // Filter out English
    const langsToTranslate = targetLanguages.filter(l => l !== 'en') as Language[];

    if (langsToTranslate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No target languages specified' },
        { status: 400 }
      );
    }

    // Determine what to translate
    let sourceText: string | Record<string, unknown>;
    let isComplexContent = false;

    if (text) {
      // Simple text field
      sourceText = text;
    } else if (content) {
      // Complex block content (JSON)
      sourceText = content;
      isComplexContent = true;
    } else {
      return NextResponse.json(
        { success: false, error: 'Either text or content is required' },
        { status: 400 }
      );
    }

    const translations: Record<string, string | Record<string, unknown>> = { en: sourceText };

    // Translate to each language
    for (const lang of langsToTranslate) {
      const langName = LANGUAGE_NAMES[lang];
      
      let prompt: string;
      
      if (isComplexContent) {
        prompt = `You are a professional translator specializing in travel and tourism content.
Translate the following tour content JSON from English to ${langName}.

IMPORTANT RULES:
1. Translate ALL text values in the JSON (titles, descriptions, items in arrays)
2. Keep the JSON structure exactly the same
3. Do NOT translate URLs, image paths, or technical keys
4. Keep numbers, dates, and times in their original format
5. Maintain the same tone - professional but friendly for tourists
6. Return ONLY valid JSON

Input JSON:
${JSON.stringify(sourceText, null, 2)}

Return ONLY the translated JSON, no explanation:`;
      } else {
        prompt = `You are a professional translator specializing in travel and tourism content.
Translate the following text from English to ${langName}.

IMPORTANT RULES:
1. Keep the translation natural and appropriate for tourism marketing
2. Maintain the same tone - professional but friendly for tourists
3. Keep any technical terms, proper nouns, or brand names as-is if appropriate
4. Return ONLY the translated text, no explanation or quotes

Text to translate:
${sourceText}

Translated text:`;
      }

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
                content: 'You are a professional translator specializing in travel and tourism content localization.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`OpenAI API error for ${lang}:`, errorData);
          continue;
        }

        const data = await response.json();
        const responseContent = data.choices[0]?.message?.content;

        if (responseContent) {
          if (isComplexContent) {
            try {
              // Remove markdown code blocks if present
              const cleanedContent = responseContent.replace(/```json\n?|\n?```/g, '').trim();
              translations[lang] = JSON.parse(cleanedContent);
            } catch (parseError) {
              console.error(`Failed to parse OpenAI response for ${lang}:`, parseError);
            }
          } else {
            translations[lang] = responseContent.trim();
          }
        }
      } catch (error) {
        console.error(`Translation error for ${lang}:`, error);
      }
    }

    // Optionally save to database
    if (saveToDatabase && blockId) {
      const supabase = await createAdminClient();
      
      for (const lang of Object.keys(translations) as Language[]) {
        if (lang === 'en') continue;
        
        const translatedContent = translations[lang];
        
        // Upsert the translation
        await supabase
          .from('tour_block_translations')
          .upsert({
            block_id: blockId,
            language: lang,
            content: isComplexContent ? translatedContent : {},
            title: !isComplexContent ? (translatedContent as string) : null,
          }, {
            onConflict: 'block_id,language',
          });
      }
    }

    return NextResponse.json({
      success: true,
      translations,
      translatedLanguages: Object.keys(translations).filter(l => l !== 'en'),
      savedToDatabase: saveToDatabase && blockId,
    });
  } catch (error) {
    console.error('Error in tour AI translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to translate content' }, { status: 500 });
  }
}




