import React, { useState } from 'react';

interface ChatFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onSkip?: () => void;
}

const reasons = [
  'Resposta rápida',
  'Problema resolvido',
  'Resposta útil',
  'Bot conhecedor',
  'Fácil de usar',
  'Outro',
];

const ChatFeedbackModal: React.FC<ChatFeedbackModalProps> = ({ open, onClose, onSubmit, onSkip }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string>('');
  const [comment, setComment] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!open) return null;

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    onSubmit({ rating, selectedReasons, answered, comment });
    setConfirmEnd(true);
  };

  const handleConfirmEnd = () => {
    setConfirmEnd(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
        {!confirmEnd ? (
          <>
            <h2 className="text-lg font-semibold text-center mb-4">Como você classificaria sua experiência de bate-papo? <span className="text-red-500">*</span></h2>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-10 h-10 rounded-lg border text-lg font-bold transition-all ${rating === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                  onClick={() => setRating(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
              <span>Terrível</span>
              <span>Excelente</span>
            </div>
            <button
              className="block mx-auto mb-4 text-sm text-gray-400 underline hover:text-blue-600"
              onClick={onSkip}
            >
              Pular e fechar
            </button>
            <hr className="my-4" />
            <div className="mb-2 text-center font-medium">Ótimo! O que correu bem? <span className="text-red-500">*</span></div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedReasons.includes(reason) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                  onClick={() => handleReasonToggle(reason)}
                  type="button"
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="mb-2 text-center font-medium">Suas dúvidas foram totalmente respondidas?</div>
            <div className="flex justify-center gap-2 mb-4">
              {['Sim', 'Não', 'De alguma forma'].map((opt) => (
                <button
                  key={opt}
                  className={`px-4 py-1.5 rounded-lg border text-sm transition-all ${answered === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                  onClick={() => setAnswered(opt)}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mb-2 text-center font-medium">Você tem algum outro comentário, pergunta ou preocupação?</div>
            <textarea
              className="w-full min-h-[70px] rounded-lg border border-gray-200 p-2 text-sm mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Digite aqui..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button
              className="w-full py-2 rounded-lg font-semibold text-white bg-blue-600 disabled:bg-gray-300 disabled:text-gray-400 transition-all mb-2"
              disabled={!rating || selectedReasons.length === 0}
              onClick={handleSubmit}
            >
              Enviar
            </button>
            <button
              className="w-full py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              onClick={onClose}
            >
              Fechar
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-semibold mb-2">Fim do bate-papo</h3>
            <p className="text-gray-500 mb-6 text-center">Tem certeza de que deseja encerrar este bate-papo?</p>
            <button
              className="w-full py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all mb-2"
              onClick={handleConfirmEnd}
            >
              Fim do bate-papo
            </button>
            <button
              className="w-full py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              onClick={() => setConfirmEnd(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatFeedbackModal;
