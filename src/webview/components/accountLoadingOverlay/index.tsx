import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

type LoadingState = 'connecting' | 'loadingAssistants' | 'loadingModels' | 'ready';

interface LoadingOverlayProps {
  isVisible: boolean;
  loadingState: LoadingState;
  onRetry: () => void;
  onClose: () => void;
  error: string | null;
}

const loadingSteps = [
  { 
    key: 'connecting', 
    text: "Connecting to OpenAI",
    emoji: "🔗"
  },
  { 
    key: 'loadingAssistants', 
    text: "Loading Assistants",
    emoji: "🤖"
  },
  { 
    key: 'loadingModels', 
    text: "Setting up Models",
    emoji: "🧠"
  },
  {
    key: 'ready',
    text: "Ready to Go!",
    emoji: "🚀"
  }
];

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, loadingState, onRetry, onClose, error }) => {
  const currentStepIndex = loadingSteps.findIndex(step => step.key === loadingState);
  const progress = ((currentStepIndex + 1) / loadingSteps.length) * 100;

  useEffect(() => {
    if (loadingState === 'ready') {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadingState, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-foreground mb-6 mx-auto flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary" />
                </div>
              </motion.div>

              <motion.div
                key={loadingState}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-center mb-6"
              >
                <h3 className="text-xl font-medium mb-2">
                  {loadingSteps[currentStepIndex].emoji} {loadingSteps[currentStepIndex].text}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {loadingState === 'ready' ? "Your AI assistant is ready!" : "Setting up your AI assistant..."}
                </p>
                <p className="text-sm font-medium">
                  Step {currentStepIndex + 1}/{loadingSteps.length}
                </p>
              </motion.div>

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-destructive/10 text-destructive rounded-md p-4 mb-4"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-sm font-medium">An error occurred</p>
                  </div>
                  <p className="text-sm mt-2">{error}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button onClick={onRetry} variant="outline" size="sm">
                      Retry
                    </Button>
                    <Button onClick={onClose} variant="destructive" size="sm">
                      Close
                    </Button>
                  </div>
                </motion.div>
              ) : null}

              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between text-sm">
                  {loadingSteps.map((step, index) => (
                    <div 
                      key={step.key} 
                      className={`flex flex-col items-center w-1/4 ${
                        index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground/30'
                      }`}
                    >
                      <span className="text-lg mb-1">{step.emoji}</span>
                      <span className="text-xs text-center">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;

