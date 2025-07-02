import React from 'react';

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on Get Started or Register, fill in your details, and follow the instructions to create your account.'
    },
    {
      question: 'How does AI matching work?',
      answer: 'Our AI analyzes your profile and preferences to recommend the best job opportunities for you.'
    },
    {
      question: 'Is SkillGlide free to use?',
      answer: 'Yes, SkillGlide is free for job seekers. Employers may have premium options.'
    },
    {
      question: 'How do I contact support?',
      answer: 'Use the Contact Us page to send us your queries or issues.'
    },
    {
      question: 'Can I edit my resume after creating it?',
      answer: 'Yes, you can edit your resume anytime from your profile or the Resume Builder.'
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-cyan-400">{faq.question}</h2>
            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 