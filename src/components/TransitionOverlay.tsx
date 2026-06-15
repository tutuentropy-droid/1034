import React from 'react';

interface TransitionOverlayProps {
  isVisible: boolean;
  color?: string;
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  isVisible,
  color = '#8B4513',
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, transparent 100%)`,
          animation: 'pageTurnOverlay 0.8s ease-in-out forwards',
          transformOrigin: 'left center',
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: 'fadeInOut 0.8s ease-in-out forwards',
        }}
      >
        <div className="text-center">
          <div
            className="text-6xl font-serif text-white mb-4 animate-pulse"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            文明在演进...
          </div>
          <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-white rounded-full"
              style={{
                animation: 'progressBar 0.8s ease-in-out forwards',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pageTurnOverlay {
          0% {
            transform: scaleX(0) rotateY(0deg);
            opacity: 1;
          }
          30% {
            transform: scaleX(1) rotateY(-5deg);
            opacity: 1;
          }
          70% {
            transform: scaleX(1) rotateY(5deg);
            opacity: 0.8;
          }
          100% {
            transform: scaleX(0) rotateY(0deg);
            opacity: 0;
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TransitionOverlay;
