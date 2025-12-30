// AI Service for generating summaries and scripts
export const aiService = {
  generateLeadSummary: async (notes: string, vehicle: string): Promise<string> => {
    // Simulate API call to OpenAI/ChatGPT
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prompt = `Summarize customer interest: ${notes} for vehicle ${vehicle} and suggest follow-up script`;
    
    // Mock AI response based on vehicle and notes
    const responses = {
      'Kushaq': `Customer shows strong interest in Kushaq. Key points: ${notes}. Suggested approach: Highlight compact SUV benefits, fuel efficiency, and safety features. Recommend test drive to experience the elevated driving position and spacious interior.`,
      'Slavia': `Customer interested in Slavia sedan. Notes: ${notes}. Follow-up strategy: Emphasize premium sedan features, advanced technology, and value proposition. Schedule test drive to showcase smooth performance and comfort.`,
      'Kodiaq': `Customer considering Kodiaq. Feedback: ${notes}. Recommendation: Focus on 7-seater capability, premium features, and robust build quality. Arrange extended test drive for family experience.`,
      'Superb': `Customer evaluating Superb. Details: ${notes}. Approach: Highlight executive sedan positioning, advanced features, and spacious cabin. Demonstrate premium technology and comfort features.`,
      'Octavia': `Customer interested in Octavia. Input: ${notes}. Strategy: Emphasize sporty design, performance, and advanced safety. Schedule test drive to experience dynamic handling and modern features.`
    };
    
    return responses[vehicle as keyof typeof responses] || `Customer shows interest in ${vehicle}. Based on notes: ${notes}. Recommend personalized consultation and test drive.`;
  },

  generateFollowUpScript: async (feedback: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const script = `
Follow-up Call Script:

"Hello [Customer Name], this is [Your Name] from Mahavir Skoda. I hope you're doing well.

I wanted to follow up on our recent conversation about the ${feedback.includes('Kushaq') ? 'Kushaq' : 'Skoda vehicle'}.

Based on your feedback: "${feedback}"

Key talking points:
• Address any concerns mentioned
• Highlight relevant vehicle benefits
• Offer additional information or test drive
• Check availability for next steps

Would you like to schedule a convenient time to visit our showroom or arrange a test drive at your preferred location?

Thank you for considering Skoda. We're here to help you make the best decision."
    `;
    
    return script;
  },

  analyzeFeedbackTrends: async (feedback: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const analysis = `
Feedback Analysis:
Input: "${feedback}"

Sentiment: ${feedback.toLowerCase().includes('not') || feedback.toLowerCase().includes('concern') ? 'Neutral/Negative' : 'Positive'}

Key Insights:
• Customer engagement level: ${feedback.length > 50 ? 'High' : 'Medium'}
• Purchase intent: ${feedback.toLowerCase().includes('interested') ? 'Strong' : 'Moderate'}
• Follow-up priority: ${feedback.toLowerCase().includes('urgent') || feedback.toLowerCase().includes('soon') ? 'High' : 'Medium'}

Recommended Actions:
• Schedule follow-up within 24-48 hours
• Prepare vehicle-specific information
• Consider incentives if price-sensitive
    `;
    
    return analysis;
  }
};