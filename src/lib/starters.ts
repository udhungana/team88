import type { ConversationStarter, FirstConversationInputs } from "@/types";

function englishStarters(input: FirstConversationInputs): ConversationStarter[] {
  const { audience, topics, cultureRegion, feeling, timePreference } = input;
  const topic = topics.trim() || "what’s been on your mind";
  const culture = cultureRegion.trim() || "your context";
  const feel = feeling.trim() || "how you’ve been feeling";

  const audienceLabel =
    audience === "family" ? "family" : "friend";

  return [
    {
      id: "s1",
      text: `I’ve been carrying something about ${topic}. I’m not looking for fixes—could we talk for 20 minutes ${timePreference}?`,
      whyItWorks:
        "Names a boundary (not fixing) and proposes a bounded time, which lowers pressure for both sides.",
    },
    {
      id: "s2",
      text: `I care about our relationship. I’ve felt ${feel} lately, and I’d like to share what that’s been like for me.`,
      whyItWorks:
        "Leads with care and uses “I” statements, which reduces defensiveness in sensitive talks.",
    },
    {
      id: "s3",
      text: `Something’s felt heavy, and I’d feel better if I could say it in my own words. Can we find a calm moment to check in?`,
      whyItWorks:
        "Asks for timing explicitly—useful when emotional nuance matters.",
    },
    {
      id: "s4",
      text: `I know ${culture} can shape how we talk about feelings. I want to be respectful—here’s what I’m hoping for: a listening ear about ${topic}.`,
      whyItWorks:
        "Acknowledges cultural framing without stereotyping; keeps the ask concrete.",
    },
    {
      id: "s5",
      text: `I’m nervous to say this, but I trust you. I’ve been dealing with ${feel}—can I walk you through it at your pace?`,
      whyItWorks:
        "Normalizes nerves and gives the other person agency (“your pace”).",
    },
    {
      id: "s6",
      text: `I’m reaching out because I don’t want to go through this alone. Could we talk as ${audienceLabel}, without judgment?`,
      whyItWorks:
        "States the need for connection directly and invites a non-judgmental frame.",
    },
    {
      id: "s7",
      text: `If now isn’t good, no worries—would ${timePreference} work? I’d like to share something important about ${topic}.`,
      whyItWorks:
        "Offers an escape hatch and respects scheduling—reduces ambush anxiety.",
    },
  ];
}

function neTimeLabel(tp: string): string {
  const map: Record<string, string> = {
    "this morning": "बिहान",
    "this afternoon": "दिउँसो",
    "this evening": "बेलुका",
    tomorrow: "भोलि",
  };
  return map[tp] ?? tp;
}

function nepaliStarters(input: FirstConversationInputs): ConversationStarter[] {
  const { audience, topics, cultureRegion, feeling, timePreference } = input;
  const topic = topics.trim() || "मेरो मनमा रहेको कुरा";
  const culture = cultureRegion.trim() || "हाम्रो संदर्भ";
  const feel = feeling.trim() || "मेरो अनुभव";
  const aud =
    audience === "family"
      ? "परिवार"
      : "साथी";
  const tlab = neTimeLabel(timePreference);

  return [
    {
      id: "n1",
      text: `${topic} बारे म केही बोकेर हिँडेको छु। म समाधान खोज्दै छैन—के हामी ${tlab} करिब २० मिनेट कुरा गर्न सक्छौं?`,
      whyItWorks:
        "सीमा तोक्छ (समाधान होइन) र समय सीमा सुझाउँछ—दुवैलाई दबाब कम हुन्छ।",
    },
    {
      id: "n2",
      text: `म हाम्रो सम्बन्धलाई महत्त्व दिन्छु। पछिल्लो समय मलाई ${feel} जस्तो लागिरहेको छ, र म आफ्नो अनुभव सुनाउन चाहन्छु।`,
      whyItWorks:
        "हेरचाह र ‘म’ वाक्यले रक्षात्मकता घटाउँछ।",
    },
    {
      id: "n3",
      text: `मनमा भारीपन छ र आफ्नै शब्दमा भने हल्का हुन्छ जस्तो लाग्छ। के हामी शान्त क्षणमा कुरा गर्न सक्छौं?`,
      whyItWorks:
        "समय माग गर्छ—भावनात्मक सूक्ष्मता महत्त्वपूर्ण हुँदा उपयोगी।",
    },
    {
      id: "n4",
      text: `${culture} ले भावना कसरी व्यक्त गर्ने भन्ने असर पार्न सक्छ भन्ने म बुझ्दछु। म सम्मानपूर्वक कुरा गर्न चाहन्छु—म ${topic} बारे सुन्ने कान मात्र चाहन्छु।`,
      whyItWorks:
        "सांस्कृतिक संवेदनशीलता देखाउँछ; माग स्पष्ट रहन्छ।",
    },
    {
      id: "n5",
      text: `भन्न डर लागिरहेको छ, तर म तपाईंमाथि भरोसा गर्छु। ${feel} सँग जुधिरहेको छु—तपाईंको गतिमा सुनाउन पाऊँ?`,
      whyItWorks:
        "डर सामान्य बनाउँछ र अर्को पक्षलाई गति छान्न दिन्छ।",
    },
    {
      id: "n6",
      text: `म एक्लै यो बाटो हिँड्न चाहन्न। के हामी ${aud} को रूपमा, बिना निर्णय गर्ने हिसाबले कुरा गर्न सक्छौं?`,
      whyItWorks:
        "जडानको आवश्यकता र गैर-निर्णयात्मक फ्रेम आमन्त्रण गर्छ।",
    },
    {
      id: "n7",
      text: `अहिले ठीक छैन भने कुनै कुरा छैन—${tlab} मिल्छ? ${topic} बारे महत्त्वपूर्ण कुरा साझा गर्न चाहन्छु।`,
      whyItWorks:
        "बाहिर निस्कने बाटो र तालिकाको सम्मान—अचानक दबाब घटाउँछ।",
    },
  ];
}

export function generateConversationStarters(
  input: FirstConversationInputs
): ConversationStarter[] {
  const lang = input.language.trim().toLowerCase();
  if (lang === "nepali" || lang === "नेपाली") {
    return nepaliStarters(input);
  }
  return englishStarters(input);
}
