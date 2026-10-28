/**
 * Local LinkedIn post generation engine.
 * Synthesizes professional, engaging posts tailored to the user's topic, tone,
 * structure, emoji preference, and hashtag selection with zero external API calls.
 */

export const generateLinkedInPost = ({
  topic = '',
  tone = 'Thought Leadership',
  format = 'Hook + Value + CTA',
  includeEmojis = true,
  includeHashtags = true
}) => {
  const cleanTopic = topic.trim().replace(/[.?]+$/, '');
  const lower = cleanTopic.toLowerCase();

  // 1. Generate Contextual Hashtags based on keywords in topic
  const hashtags = generateHashtags(lower);

  // 2. Select Emojis or Clean Markers
  const em = includeEmojis
    ? {
        star: '⭐',
        bulb: '💡',
        rocket: '🚀',
        target: '🎯',
        pin: '📌',
        check: '✅',
        down: '👇',
        zap: '⚡',
        gear: '⚙️',
        chart: '📈'
      }
    : {
        star: '•',
        bulb: '•',
        rocket: '•',
        target: '•',
        pin: '•',
        check: '•',
        down: '',
        zap: '•',
        gear: '•',
        chart: '•'
      };

  let body = '';

  // 3. Assemble Post Based on Format & Tone
  if (format === 'Numbered Listicle') {
    body = buildListicle(cleanTopic, tone, em);
  } else if (format === 'Deep-Dive Story') {
    body = buildStory(cleanTopic, tone, em);
  } else {
    // Default: Hook + Value + CTA
    body = buildHookValueCTA(cleanTopic, tone, em);
  }

  // 4. Append Hashtags if requested
  if (includeHashtags && hashtags.length > 0) {
    body += `\n\n${hashtags.join(' ')}`;
  }

  return body;
};

function buildHookValueCTA(topic, tone, em) {
  if (tone === 'Contrarian / Punchy') {
    return (
      `Unpopular opinion: Most conventional advice about ${topic} misses the real challenge.\n\n` +
      `Here is what actually happens in practice:\n\n` +
      `${em.pin} Adding complexity is easy; ruthless simplicity requires real discipline.\n` +
      `${em.pin} Following the crowd gives you average results at best.\n` +
      `${em.pin} Focusing on surface-level tactics distracts from underlying architecture and incentives.\n\n` +
      `When you step back and question default assumptions, you build solutions that stand the test of time.\n\n` +
      `Agree or disagree? What has been your firsthand experience with this? ${em.down}`
    );
  }

  if (tone === 'Storytelling') {
    return (
      `A pivotal moment in my career was completely rethinking ${topic}.\n\n` +
      `Early on, I assumed the answer was simply putting in more hours and moving faster.\n\n` +
      `Then reality hit:\n` +
      `${em.bulb} Moving fast in the wrong direction just builds technical and operational debt.\n` +
      `${em.bulb} Clear alignment and system boundaries always beat brute-force execution.\n` +
      `${em.bulb} The highest leverage decisions are the ones that eliminate unnecessary work for others.\n\n` +
      `Once we made that mental shift, our team's delivery velocity and morale completely transformed.\n\n` +
      `What was a defining project or turning point that changed how you approach your work? ${em.down}`
    );
  }

  if (tone === 'Educational How-To') {
    return (
      `If you want to excel at ${topic}, here is a high-leverage mental model:\n\n` +
      `${em.check} 1. Diagnose the Root Problem: Separate temporary symptoms from architectural bottlenecks.\n` +
      `${em.check} 2. Protect Core Boundaries: Define strict inputs, outputs, and ownership before building.\n` +
      `${em.check} 3. Tighten Feedback Loops: Measure progress in hours or days, not quarterly surprises.\n` +
      `${em.check} 4. Document and Automate: Turn solved problems into repeatable standards for your team.\n\n` +
      `Mastering the fundamentals consistently outperforms chasing the latest trend.\n\n` +
      `What is one habit or practice that made the biggest difference in your execution? ${em.down}`
    );
  }

  if (tone === 'Celebratory') {
    return (
      `Excited to share a major milestone around ${topic} ${em.rocket}\n\n` +
      `Looking back at where this journey began, it took consistent iteration and navigating plenty of unknown territory.\n\n` +
      `Key lessons that made this possible:\n` +
      `${em.star} Staying focused on high-impact priorities when distractions were plentiful.\n` +
      `${em.star} Embracing candid feedback from teammates and stakeholders.\n` +
      `${em.star} Remembering that steady, incremental progress compounds into massive breakthroughs.\n\n` +
      `Huge thank you to everyone who offered guidance and support along the way.\n\n` +
      `What is a recent win or breakthrough you or your team are proud of? Let's celebrate below! ${em.down}`
    );
  }

  // Default: Thought Leadership
  return (
    `In modern high-performing organizations, ${topic} is where competitive advantage is won or lost.\n\n` +
    `Here is what separates top performers from the rest:\n\n` +
    `${em.target} Systems thinking over firefighting: Designing workflows that prevent bottlenecks before they emerge.\n` +
    `${em.target} Clarity over volume: Communicating context so well that every team member can make autonomous decisions.\n` +
    `${em.target} Long-term leverage: Investing today in infrastructure and standards that pay dividends for years.\n\n` +
    `When you elevate your approach to ${topic}, you stop reacting to urgent noise and start steering meaningful outcomes.\n\n` +
    `How does your team prioritize this in day-to-day operations? What has worked best for you? ${em.down}`
  );
}

function buildListicle(topic, tone, em) {
  const hookIntro =
    tone === 'Contrarian / Punchy'
      ? `5 hard-learned truths about ${topic} that most people avoid discussing:`
      : tone === 'Educational How-To'
      ? `5 practical rules I follow to master ${topic}:`
      : `5 fundamental principles about ${topic} that every leader should keep in mind:`;

  return (
    `${hookIntro}\n\n` +
    `1. Start with first principles\n` +
    `Don't copy someone else's playbook without understanding the context in which it was created.\n\n` +
    `2. Optimize for clarity over cleverness\n` +
    `The best solutions are the ones that are easily understood, audited, and maintained by everyone on the team.\n\n` +
    `3. Protect your feedback loops\n` +
    `Whether it is automated testing, customer surveys, or peer reviews, rapid feedback prevents costly course corrections.\n\n` +
    `4. Respect operational debt\n` +
    `Every shortcut taken today charges high interest tomorrow. Address friction points while they are still small.\n\n` +
    `5. Empower ownership\n` +
    `Give people clear goals and guardrails, then trust them to execute with creative autonomy.\n\n` +
    `Which of these 5 resonates the most with where you are in your career today? ${em.down}`
  );
}

function buildStory(topic, tone, em) {
  return (
    `A few years ago, I had a conversation that completely reshaped my perspective on ${topic}.\n\n` +
    `We were in the middle of a high-stakes project. Deadlines were looming, tensions were mounting, and everyone was pushing hard to get across the finish line.\n\n` +
    `A senior mentor pulled me aside and said something that stuck with me:\n\n` +
    `"You are working twice as hard as you need to because you are solving the symptoms instead of redesigning the core structure."\n\n` +
    `That sentence hit hard. We stopped rushing, took a day to re-evaluate our architecture, and realized that our friction was self-inflicted.\n\n` +
    `Here is what we changed:\n` +
    `${em.bulb} Clarified exact responsibilities across teams to avoid redundant handoffs.\n` +
    `${em.bulb} Removed 3 layers of unnecessary meetings and replaced them with concise written briefs.\n` +
    `${em.bulb} Focused our attention solely on the 20% of work delivering 80% of value.\n\n` +
    `The result? We shipped on time, with higher quality, and zero burnout.\n\n` +
    `Have you ever had a reality check that changed how you approach your craft? What did you learn? ${em.down}`
  );
}

function generateHashtags(lower) {
  const tags = new Set(['#CareerGrowth', '#ProfessionalDevelopment']);

  if (lower.includes('code') || lower.includes('engineer') || lower.includes('software') || lower.includes('dev')) {
    tags.add('#SoftwareEngineering');
    tags.add('#Programming');
    tags.add('#TechCommunity');
  }

  if (lower.includes('lead') || lower.includes('manage') || lower.includes('team') || lower.includes('culture')) {
    tags.add('#TechLeadership');
    tags.add('#Management');
    tags.add('#Leadership');
  }

  if (lower.includes('cloud') || lower.includes('aws') || lower.includes('devops') || lower.includes('system') || lower.includes('scale')) {
    tags.add('#SystemDesign');
    tags.add('#CloudComputing');
    tags.add('#DevOps');
  }

  if (lower.includes('ai') || lower.includes('data') || lower.includes('ml')) {
    tags.add('#ArtificialIntelligence');
    tags.add('#MachineLearning');
    tags.add('#TechTrends');
  }

  if (lower.includes('product') || lower.includes('startup') || lower.includes('business')) {
    tags.add('#Startups');
    tags.add('#ProductManagement');
    tags.add('#Innovation');
  }

  if (lower.includes('remote') || lower.includes('work') || lower.includes('hiring')) {
    tags.add('#RemoteWork');
    tags.add('#WorkplaceCulture');
  }

  return Array.from(tags).slice(0, 5);
}
