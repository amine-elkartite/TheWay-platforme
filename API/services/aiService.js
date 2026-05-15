const config = require('../lib/config');
const { httpError } = require('../lib/response');

const CV_PROMPT_VERSION = 'cv-analysis-v1';
const MATCHING_PROMPT_VERSION = 'matching-v1';

function ensureConfigured() {
    if (config.nodeEnv === 'test' && config.ai.provider === 'test') return;
    if (!config.ai.provider || !config.ai.apiKey || !config.ai.baseUrl || !config.ai.model) {
        throw httpError(503, 'ai_not_configured', 'AI provider is not configured');
    }
}

async function analyseCvText(text) {
    ensureConfigured();
    if (config.nodeEnv === 'test' && config.ai.provider === 'test') {
        const skills = Array.from(new Set(String(text).match(/\b(JavaScript|Node|SQL|React|Python|Docker|Excel)\b/gi) || []));
        return {
            promptVersion: CV_PROMPT_VERSION,
            providerResponseId: 'test-cv-analysis',
            summary: 'Automated test CV analysis',
            extractedSkills: skills,
            raw: { skills }
        };
    }

    const response = await chatJson([
        {
            role: 'system',
            content: 'You extract structured career information. Respond only with valid JSON.'
        },
        {
            role: 'user',
            content: [
                'Analyse this CV text and return JSON with keys:',
                'summary:string, extractedSkills:string[], seniority:string, recommendedRoles:string[].',
                '',
                text
            ].join('\n')
        }
    ]);

    return {
        promptVersion: CV_PROMPT_VERSION,
        providerResponseId: response.id || null,
        summary: response.json.summary || '',
        extractedSkills: Array.isArray(response.json.extractedSkills) ? response.json.extractedSkills : [],
        raw: response.json
    };
}

async function rankOpportunities(profile) {
    ensureConfigured();
    if (config.nodeEnv === 'test' && config.ai.provider === 'test') {
        return {
            promptVersion: MATCHING_PROMPT_VERSION,
            providerResponseId: 'test-matching',
            matches: profile.opportunities.slice(0, 5).map((opportunity, index) => ({
                opportunityId: opportunity.id,
                score: Math.max(50, 95 - index * 5),
                matchedSkills: profile.skills.slice(0, 3),
                missingSkills: [],
                explanation: 'Automated test match'
            })),
            raw: {}
        };
    }

    const response = await chatJson([
        {
            role: 'system',
            content: 'You rank job opportunities for a candidate. Respond only with valid JSON.'
        },
        {
            role: 'user',
            content: JSON.stringify({
                instruction: 'Return JSON: { matches: [{ opportunityId, score, matchedSkills, missingSkills, explanation }] }. Score is 0-100 and must be evidence based.',
                candidateSkills: profile.skills,
                cvSummary: profile.summary,
                opportunities: profile.opportunities.map(item => ({
                    opportunityId: item.id,
                    title: item.title,
                    company: item.company,
                    location: item.location,
                    skills: item.skills,
                    description: String(item.description || '').slice(0, 1200)
                }))
            })
        }
    ]);

    return {
        promptVersion: MATCHING_PROMPT_VERSION,
        providerResponseId: response.id || null,
        matches: Array.isArray(response.json.matches) ? response.json.matches : [],
        raw: response.json
    };
}

async function chatJson(messages) {
    const base = config.ai.baseUrl.replace(/\/$/, '');
    const endpoint = base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.ai.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.ai.model,
            response_format: { type: 'json_object' },
            temperature: 0.2,
            messages
        })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw httpError(502, 'ai_provider_error', 'AI provider request failed', payload);
    }
    const content = payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    try {
        return {
            id: payload.id,
            json: JSON.parse(content || '{}')
        };
    } catch (error) {
        throw httpError(502, 'ai_invalid_json', 'AI provider returned invalid JSON');
    }
}

module.exports = {
    analyseCvText,
    rankOpportunities,
    CV_PROMPT_VERSION,
    MATCHING_PROMPT_VERSION
};
