export const creativityLevels=[0,25,50,75,100] as const;
export type Creativity=typeof creativityLevels[number];
export const reconstructionLabels:Record<Creativity,string>={0:'사실 그대로',25:'가볍게 연결',50:'자연스럽게 재구성',75:'풍부하게 표현',100:'자유롭게 재구성'};
export const creativityDescriptions:Record<Creativity,string>={0:'입력한 감정과 확인된 사실만으로 씁니다.',25:'사실을 지키며 가벼운 느낌을 조금 보완합니다.',50:'장면에 어울리는 감정과 짧은 생각을 더해 연결합니다.',75:'감정의 흐름과 내적 독백을 풍부하게 재구성합니다.',100:'실제 장면을 바탕으로 감정과 성찰을 자유롭게 구성합니다. 실제 마음과 다를 수 있어요.'};
export const reconstructionGuides:Record<Creativity,string>={
 0:'STRICT: Only verified facts and supplied feelings/thoughts. No invented feelings, reflections, relationships, locations, dialogue, motives or off-camera events.',
 25:'LIGHT: You may add a little mild, ordinary first-person feeling to connect the scene (a quiet pause, slight interest, ease), without forcing it into every paragraph. Keep intensity low. No deep emotional turning point, invented event or relationship.',
 50:'BALANCED: You may add plausible first-person emotions and brief reflections grounded in the actual scene, even when not reported. Weave experience -> feeling -> thought in the personal voice. Do not invent an external cause or event to justify an emotion.',
 75:'EXPRESSIVE: You may develop an emotional arc, nuanced feelings and inner monologue around the actual experiences. Maintain a consistent voice and avoid generic life lessons. Do not add external events, quotations, identities or relationships.',
 100:'FREE EMOTIONAL RECONSTRUCTION: Freely shape first-person emotions, introspection and a resonant ending around the actual photos and supplied experiences, including feelings the user did not report. This is emotional reconstruction of a real record, not permission to invent external events or a fictional biography.'
};
export const emotionBoundaries='At every level, explicit user feelings, including absence of feeling or indifference, override imagined emotion. Never contradict or overwrite them. Never infer another real person’s private feelings, romantic feelings toward someone, trauma, grief, diagnoses, religion, sensitive relationships, personality history or bodily symptoms from photos. Emotional freedom never permits invented events, speech, identity, precise places or travel routes. At level 0 do not add any unreported feeling. At nonzero levels permitted narrator feelings/reflections are intentional reconstruction, not verified facts; do not remove them merely because they were not supplied.';
export function resultDisclosure(level:Creativity,fiction:boolean){return fiction?'이 글은 사진에서 영감을 받아 AI가 창작한 단편소설입니다.':level===100?'AI가 장면의 연결과 감정·생각을 자유롭게 재구성했습니다. 실제 경험이나 마음과 다른 부분이 있을 수 있어요.':level>=50?'일부 감정·생각과 장면 연결에는 AI의 재구성이 포함되어 있습니다.':level===25?'일부 느낌과 표현을 AI가 보완했습니다.':null;}
export const toneGuides:Record<string,string>={
 plain:'Clear everyday Korean, concrete observations, varied sentence length, quiet endings. Reflections follow the selected reconstruction permission; supplied thoughts take priority. Avoid report-like captions and ornate adjectives.',
 emotional:'Small sensory details, restrained emotional subtext, pauses and unsaid meaning. No melodrama or generic nostalgia. Do not name or imitate a particular novel or author. In memory formats, follow the selected permission for additional narrator feelings.',
 cinematic:'Economical spoken rhythm, flowing narration and purposeful transitions. In record/travel, quote only dialogue actually supplied by the user; never invent speech. Original dialogue is permitted only in fiction.',
 literary:'Precise images, rhythm, meaningful pauses and intelligible metaphors. Write lyrical prose with substance. In memory formats, metaphor must not imply unverified events; narrator feelings follow reconstruction permission.',
 witty:'Use the plain personal record style. Do not add jokes.'
};
