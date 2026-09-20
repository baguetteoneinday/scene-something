export const creativityLevels=[0,25,50,75,100] as const;
export type Creativity=typeof creativityLevels[number];
export const reconstructionLabels:Record<Creativity,string>={0:'사실 그대로',25:'가볍게 연결',50:'자연스럽게 재구성',75:'풍부하게 표현',100:'자유롭게 재구성'};
export const creativityDescriptions:Record<Creativity,string>={0:'확인된 사진과 답변만으로 자연스럽게 씁니다.',25:'사실을 지키며 문장과 장면을 가볍게 연결합니다.',50:'반복을 덜고 장면의 흐름과 리듬을 다듬습니다.',75:'실제 기억을 중심으로 시작과 마무리, 표현을 풍부하게 구성합니다.',100:'사진과 경험을 중심으로 장면과 표현을 적극적으로 연결합니다. 실제 기억과 다른 부분이 있을 수 있어요.'};
export const reconstructionGuides:Record<Creativity,string>={
 0:'STRICT: Use only verified visual facts and supplied answers. Compose fluent transitions without implying new events. No invented feelings, relationships, locations, dialogue, motives or off-camera events.',
 25:'LIGHT: Preserve every supplied fact; gently connect sentences, order descriptions and express visibly supported atmosphere. No new events or narrator emotions.',
 50:'BALANCED: Compress repeated observations, connect established scenes and vary narrative rhythm. No new concrete events, relationships or unreported feelings. Never invent causal links.',
 75:'EXPRESSIVE: Rich expression, thematic structure and a developed opening and closing around confirmed experiences. No identity or sensitive relationship inference, new factual events, fake quotations or invented narrator emotions.',
 100:'FREE RECONSTRUCTION: Create a complete readable personal record using the strongest scene connections, atmosphere, opening and closing. Limited imaginative language means metaphor and analogy ONLY, never invented factual events, dialogue, relationships or narrator emotions. Remain anchored to actual photos and experience: this is NOT fiction.'
};
export function resultDisclosure(level:Creativity,fiction:boolean){return fiction?'이 글은 사진에서 영감을 받아 AI가 창작한 단편소설입니다.':level===100?'AI가 사진을 바탕으로 일부 장면과 표현을 재구성했습니다. 실제 기억과 다른 부분이 있을 수 있어요.':level>=50?'일부 표현과 장면 연결에는 AI의 재구성이 포함되어 있습니다.':null;}
export const toneGuides:Record<string,string>={
 plain:'Clear everyday Korean, concrete observations, varied sentence length, quiet endings. Reflection only when grounded in supplied answers. Avoid report-like captions and ornate adjectives.',
 emotional:'Small sensory details, restrained emotional subtext, pauses and unsaid meaning. No melodrama or generic nostalgia. Do not name or imitate a particular novel or author. In memory formats, emotions must come from user answers.',
 cinematic:'Economical spoken rhythm, flowing narration and purposeful transitions. In record/travel, quote only dialogue actually supplied by the user; never invent speech. Original dialogue is permitted only in fiction.',
 literary:'Precise images, rhythm, meaningful pauses and intelligible metaphors. Write lyrical prose with substance. In memory formats, metaphor must not imply unverified events or feelings.',
 witty:'Use the plain personal record style. Do not add jokes.'
};
