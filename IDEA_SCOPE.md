# IDEA_SCOPE.md

### Sarvam Epoch Buildathon — D2C Brand Reactivation Voice Agent

### Idea Lock

|Decision Locked answer|
|---|---|
| **One-sentence product** |A web app where a brand manager defines their brand's personality → generates a reactivation call script in Hindi (brand has never spoken it before) → plays A/B comparison: machine-translated baseline vs Sarvam-30B personality-constrained version → native speaker scores both|
| **User** | Tanya (retention manager at a D2C personal care brand) |
| **Job completed** | Generate a reactivation call script that sounds like the brand in a language the brand has never used before |
| **hard input** | Brand personality as testable attributes (not adjectives), lapsed customer data, purchase history, reactivation offer |
| **Final output** | Two audio clips + attribute scores proving personality transfer |
| **Sarvam parameter** | Voice Experience |
| **Additional capability** | Mayura/Translate for the naive baseline — not scored, used only for comparison |
| **Exact sponsor APIs** | `https://api.sarvam.ai/v1/chat/completions` (model: sarvam-30b) for generation; `https://api.sarvam.ai/text-to-speech` (model: bulbul:v3) for audio |
| **Supported language/input subset** | Hindi (hi-IN) primary, Marathi (mr-IN) secondary |
| **Team advantage** | Both members speak Hindi natively; brand/content experience (Rahasya Stories); Next.js speed |
| **Creativity thesis** | Brand register transfer into a language with no precedent - define personality as testable attributes, generate in-language rather than translate, prove via native-speaker blind scoring |
| **Delight thesis** | Side-by-side playback where judges hear the dead translated version vs the alive brand version; native speaker points at the attribute list and says "this one sounds like the brand" |
| **Demo proof** | Play machine-translated vs generated version back-to-back; native speaker scores both on screen |
| **Non-goals** | No real telephony, no real CRM integration, no multi-language UI, no auth, no database of real customers |