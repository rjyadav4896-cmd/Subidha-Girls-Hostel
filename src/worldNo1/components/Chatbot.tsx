import { useState } from 'react';
import { Send, X } from 'lucide-react';

export default function Chatbot({ phoneDisplay }: { phoneDisplay: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: 'bot' | 'user'; text: string }[]>([{ type: 'bot', text: 'Namaste! How can I help you with Subidha Girls Hostel?' }]);
  const [input, setInput] = useState('');

  const faqs = [
    { question: 'Room fees', answer: '2 sharing is रु 8,500 and 3 sharing is रु 8,000 per month. Admission fee is रु 1,000.' },
    { question: 'Meal time', answer: 'Breakfast: 5:30 AM - 6:30 AM, Lunch: 8:00 AM - 10:00 PM, Snacks: 1:30 PM - 4:00 PM, Dinner: 6:30 PM - 7:30 PM.' },
    { question: 'Location', answer: 'Subidha Girls Hostel is in Bajrang Chowk, Janakpur. Highway, OM Coaching Centre, ANTI College, stationery, and hospital are nearby.' },
    { question: 'Contact', answer: `Please call or WhatsApp ${phoneDisplay} for direct details.` }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { type: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMessage]);

    const lower = input.toLowerCase();
    let response = `Please contact us at ${phoneDisplay} for more information.`;
    for (const faq of faqs) {
      if (lower.includes(faq.question.toLowerCase().split(' ')[0])) {
        response = faq.answer;
        break;
      }
    }

    window.setTimeout(() => setMessages((prev) => [...prev, { type: 'bot', text: response }]), 400);
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    const faq = faqs.find((f) => f.question === question);
    if (faq) window.setTimeout(() => setMessages((prev) => [...prev, { type: 'bot', text: faq.answer }]), 400);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`ask-subidha-launcher fixed bottom-5 right-5 z-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 ${
          isOpen ? 'is-open' : ''
        }`}
        aria-label={isOpen ? 'Close Ask Subidha chat' : 'Open Ask Subidha chat'}
      >
        <span className="ask-subidha-bubble" aria-hidden="true">
          {isOpen ? (
            <X className="ask-subidha-close" />
          ) : (
            <svg viewBox="0 0 64 64" role="img">
              <defs>
                <radialGradient id="ask-subidha-blue-gradient" cx="38%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="58%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </radialGradient>
              </defs>
              <circle className="ask-subidha-circle" cx="32" cy="32" r="32" />
              <path
                className="ask-subidha-chatmark"
                d="M22.5 36.8 C18.9 33.5 18.6 27.9 21.8 24 C25.5 19.5 32.4 18.7 37.6 21.8 C43.2 25.1 45.3 31.7 42.5 36.9 C39.6 42.3 32.4 44.4 26.9 41.5 L21.5 43.6 L22.5 36.8"
              />
              <text className="ask-subidha-circle-text" x="32" y="33" textAnchor="middle">
                ask
              </text>
            </svg>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="ask-subidha-window fixed bottom-24 right-5 z-50 flex max-h-[500px] w-[calc(100vw-2.5rem)] max-w-96 flex-col">
          <div className="ask-subidha-header px-4 py-3">
            <h3 className="font-display text-base font-bold text-slate-950">ask subidha</h3>
            <p className="text-xs font-medium text-slate-500">Subidha Girls Hostel support</p>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`ask-subidha-message max-w-[82%] px-3 py-2 ${
                  message.type === 'user' ? 'ask-subidha-message-user text-white' : 'ask-subidha-message-bot text-slate-950'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 text-center mb-2">Quick questions</p>
                {faqs.map((faq) => (
                  <button key={faq.question} onClick={() => handleQuickQuestion(faq.question)} className="ask-subidha-quick w-full px-3 py-2 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50">
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ask-subidha-composer p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="ask-subidha-input min-w-0 flex-1 px-3 py-2 text-sm focus:outline-none"
              />
              <button onClick={handleSend} className="ask-subidha-send flex h-10 w-10 items-center justify-center transition-transform hover:-translate-y-0.5" aria-label="Send message">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
