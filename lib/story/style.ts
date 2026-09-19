export const creativityLevels=[0,25,50,75,100] as const;
export type Creativity=typeof creativityLevels[number];
export const creativityDescriptions:Record<Creativity,string>={0:'확인된 사진과 답변만으로 씁니다.',25:'사실을 중심으로 비유와 상상을 조금 더합니다.',50:'실제 기억과 창작한 장면을 함께 엮습니다.',75:'사진을 바탕으로 사건과 대화를 폭넓게 창작합니다.',100:'사진에서 영감을 받아 자유롭게 창작합니다.'};
export const toneGuides:Record<string,string>={
 plain:'Korean personal essay craft: concrete everyday observations, unforced reflection grounded in supplied context, clear sentences of varied length, quiet endings. Avoid report-like captions and ornate adjectives.',
 emotional:'Contemporary Korean and Japanese literary fiction craft: small sensory details, restrained emotional subtext, pauses and unsaid meaning. Show through scenes instead of naming every feeling. No melodrama or generic nostalgia.',
 cinematic:'Film dialogue and voice-over craft: establish a scene, vary wide shots and close details through prose, use economical spoken rhythm and natural voice-over transitions. Dialogue only if supplied verbatim at creativity 0; invented dialogue requires creativity permission.',
 literary:'Poetry craft: precise images, rhythm, meaningful line breaks, deliberate repetition used sparingly, unexpected but intelligible metaphors. Write lyrical prose with substance, not a pile of abstract words.',
 witty:'Use the plain personal essay style. Do not add jokes.'
};
