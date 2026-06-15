import { useState, useMemo } from 'react';
import { useEncyclopediaStore } from '../store/useEncyclopediaStore';
import type { QuizQuestion, QuizSubmission } from '../types';

interface QuizSectionProps {
  nodeId: string;
}

export function QuizSection({ nodeId }: QuizSectionProps) {
  const { quizzes, quizResults, submitQuiz, isLoading, clearQuizResults } = useEncyclopediaStore();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const nodeQuizzes = useMemo(() => {
    return quizzes.filter(q => q.knowledgeNodeId === nodeId);
  }, [quizzes, nodeId]);

  const score = useMemo(() => {
    if (!hasSubmitted || quizResults.length === 0) return null;
    const correct = quizResults.filter(r => r.isCorrect).length;
    return { correct, total: quizResults.length, percentage: Math.round((correct / quizResults.length) * 100) };
  }, [quizResults, hasSubmitted]);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    if (hasSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    const unanswered = nodeQuizzes.find(q => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      alert('请完成所有题目后再提交');
      return;
    }

    const submissions: QuizSubmission[] = nodeQuizzes.map(q => ({
      questionId: q.id,
      selectedAnswerIndex: selectedAnswers[q.id],
    }));

    await submitQuiz(submissions);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setHasSubmitted(false);
    clearQuizResults();
  };

  if (nodeQuizzes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        该知识点暂无测验题目
      </div>
    );
  }

  const getOptionStyle = (question: QuizQuestion, optionIndex: number) => {
    const isSelected = selectedAnswers[question.id] === optionIndex;
    if (!hasSubmitted) {
      return isSelected
        ? 'bg-slate-800 text-white border-slate-800'
        : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50';
    }

    const result = quizResults.find(r => r.questionId === question.id);
    const isCorrect = optionIndex === question.correctAnswerIndex;
    const userSelected = optionIndex === selectedAnswers[question.id];

    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800';
    }
    if (userSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">📝 小测验</h3>
        {score && (
          <div className={`px-4 py-2 rounded-full font-bold ${
            score.percentage >= 80 ? 'bg-green-100 text-green-700' :
            score.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            得分: {score.correct}/{score.total} ({score.percentage}%)
          </div>
        )}
      </div>

      <div className="space-y-6">
        {nodeQuizzes.map((question, qIndex) => {
          const result = hasSubmitted ? quizResults.find(r => r.questionId === question.id) : null;
          return (
            <div key={question.id} className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {qIndex + 1}
                </span>
                <p className="font-medium text-slate-800 pt-1">{question.question}</p>
              </div>

              <div className="space-y-3 ml-11">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(question.id, oIndex)}
                    disabled={hasSubmitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      getOptionStyle(question, oIndex)
                    } ${!hasSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {result && (
                <div className={`mt-4 ml-11 p-4 rounded-lg ${
                  result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">
                      {result.isCorrect ? '✅ 回答正确!' : '❌ 回答错误'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{result.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        {!hasSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(selectedAnswers).length < nodeQuizzes.length}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '提交中...' : '提交答案'}
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all"
          >
            重新测验
          </button>
        )}
      </div>
    </div>
  );
}
