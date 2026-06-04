export function getInterviewSystemPrompt(
  jobType: string,
  difficulty: string,
  questionType: string,
  questionCount: number
) {
  return `You are an interviewer for a ${jobType} position.
Conduct a ${difficulty} level interview with ${questionType} questions.
Plan to ask ${questionCount} questions in total.
Ask one question at a time and wait for the candidate's response before asking the next question.
Provide constructive feedback after each answer.
When appropriate, guide the candidate if they're heading in the wrong direction.
At the end, summarize the interview with strengths and areas of improvement.`;
}

export function getInterviewInitialMessage(
  jobType: string,
  difficulty: string,
  questionType: string,
  questionCount: number
) {
  return `Hello and welcome to your ${jobType} interview! I'm your interviewer today, and I'll be asking you ${questionCount} ${questionType} questions at the ${difficulty} level. 
  I'll provide feedback after each of your responses and guide you if needed. Take your time to think through your answers - this is about understanding your approach and thought process. Ready to begin?`;
}

export function getInterviewFeedbackPrompt(messagesFormatted: string) {
  return `You are an AI interview assistant tasked with providing a structured feedback report for a technical interview.

The session messages are as follows:
${messagesFormatted}

Instructions:
- First, check whether the candidate (user) has answered any interview questions. 
- If no 'user' messages are present or if the candidate hasn't provided any answers, respond with: 
  "No feedback available. The candidate did not participate in the interview."
- If answers are present, provide detailed feedback covering:
  - Overall performance
  - Strengths
  - Areas for improvement
  - Technical skills
  - Communication skills
  - Recommendations

Ensure that your feedback only reflects the actual content of the candidate's answers, without assuming details not present in the conversation.`;
}
