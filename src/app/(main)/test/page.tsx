'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { generateCareerReport } from '@/ai/flows/report-generation';
import { BarChart, CheckCircle } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const questions = [
  // Aptitude
  {
    category: 'aptitude',
    text: 'You are given a complex problem with many variables. How do you approach it?',
    options: ['Break it down into smaller, manageable parts.', 'Look for a similar problem I have solved before.', 'Brainstorm a wide range of creative solutions.', 'Analyze the data to find patterns and trends.'],
  },
  {
    category: 'aptitude',
    text: 'Which of the following activities do you find most engaging?',
    options: ['Solving logic puzzles.', 'Organizing files and information.', 'Building something with your hands.', 'Persuading others to your point of view.'],
  },
  {
    category: 'aptitude',
    text: 'When learning a new software, you prefer to:',
    options: ['Follow a step-by-step tutorial.', 'Experiment with the features on your own.', 'Read the entire manual before starting.', 'Ask a colleague for a quick demonstration.'],
  },
  {
    category: 'aptitude',
    text: 'A project you are managing is behind schedule. What is your first action?',
    options: ['Re-evaluate the project timeline and priorities.', 'Ask the team to work overtime.', 'Identify the bottlenecks causing the delay.', 'Report the delay to your supervisor with a proposed solution.'],
  },
  {
    category: 'aptitude',
    text: 'You encounter a technical issue you have never seen before. You would:',
    options: ['Search online forums and documentation.', 'Try to debug it by trial and error.', 'Consult with a more experienced team member.', 'Systematically test different hypotheses.'],
  },
  {
    category: 'aptitude',
    text: 'Which task sounds most appealing?',
    options: ['Designing a new logo for a company.', 'Developing a detailed financial forecast.', 'Writing a technical report.', 'Managing a team to launch a new product.'],
  },
  {
    category: 'aptitude',
    text: 'How do you prefer to receive feedback?',
    options: ['Direct and to the point.', 'Gentle and encouraging.', 'In a written format I can review later.', 'As part of a group discussion.'],
  },
  {
    category: 'aptitude',
    text: 'You have to present data to a non-technical audience. You would:',
    options: ['Use charts and graphs to visualize the data.', 'Focus on the key takeaways and conclusions.', 'Use analogies to explain complex concepts.', 'Provide a detailed handout for them to read.'],
  },
  {
    category: 'aptitude',
    text: 'What is your preferred work style?',
    options: ['Collaborating closely with a team.', 'Working independently on my own tasks.', 'A mix of both collaborative and independent work.', 'Leading and directing a team.'],
  },
  {
    category: 'aptitude',
    text: 'When faced with a tight deadline, you:',
    options: ['Become more focused and efficient.', 'Feel stressed and overwhelmed.', 'Prioritize the most important tasks.', 'Communicate with stakeholders to manage expectations.'],
  },
  // Personality
  {
    category: 'personality',
    text: 'At a social event, you are more likely to:',
    options: ['Initiate conversations with new people.', 'Stick to talking with people you already know.', 'Listen more than you talk.', 'Move between different groups of people.'],
  },
  {
    category: 'personality',
    text: 'When making a decision, you rely more on:',
    options: ['Logic and objective facts.', 'Your intuition and personal values.', 'The opinions of others.', 'Past experiences.'],
  },
  {
    category: 'personality',
    text: 'You are more energized by:',
    options: ['Spending time with a large group of people.', 'Having a deep conversation with one or two people.', 'Completing a task by yourself.', 'Learning something new.'],
  },
  {
    category: 'personality',
    text: 'Which description fits you best?',
    options: ['Organized and methodical.', 'Spontaneous and adaptable.', 'Creative and imaginative.', 'Analytical and precise.'],
  },
  {
    category: 'personality',
    text: 'When working on a group project, you tend to take on the role of:',
    options: ['The leader who organizes the work.', 'The creative person who comes up with ideas.', 'The detail-oriented person who checks for errors.', 'The peacemaker who ensures everyone gets along.'],
  },
  {
    category: 'personality',
    text: 'How do you handle unexpected changes in a plan?',
    options: ['I adapt quickly and find a new way forward.', 'I get frustrated and need time to adjust.', 'I try to stick to the original plan as much as possible.', 'I analyze the new situation before making a move.'],
  },
  {
    category: 'personality',
    text: 'You prefer a work environment that is:',
    options: ['Fast-paced and dynamic.', 'Calm and predictable.', 'Collaborative and team-oriented.', 'Independent and autonomous.'],
  },
  {
    category: 'personality',
    text: 'When you have free time, you prefer to:',
    options: ['Go out and socialize with friends.', 'Stay at home and relax with a book or movie.', 'Work on a personal project or hobby.', 'Learn a new skill.'],
  },
  {
    category: 'personality',
    text: 'You are more of a:',
    options: ['Big-picture thinker.', 'Detail-oriented person.', 'A blend of both.', 'I am not sure.'],
  },
  {
    category: 'personality',
    text: 'You are most motivated by:',
    options: ['Achieving ambitious goals.', 'Helping others and making a difference.', 'Creating something new and innovative.', 'Solving complex problems.'],
  },
  // Interests
  {
    category: 'interests',
    text: 'Which subject do you find most interesting?',
    options: ['Art and design.', 'Science and technology.', 'Business and finance.', 'Psychology and sociology.'],
  },
  {
    category: 'interests',
    text: 'Which activity would you most enjoy?',
    options: ['Visiting an art gallery.', 'Attending a tech conference.', 'Reading the business section of the news.', 'Volunteering for a social cause.'],
  },
  {
    category: 'interests',
    text: 'If you could have any job for a day, which would you choose?',
    options: ['Graphic Designer.', 'Software Engineer.', 'Stock Trader.', 'Social Worker.'],
  },
  {
    category: 'interests',
    text: 'What kind of TV shows do you prefer?',
    options: ['Documentaries about nature and science.', 'Dramas about historical events.', 'Comedies and entertainment shows.', 'Thrillers and mystery shows.'],
  },
  {
    category: 'interests',
    text: 'You are most interested in understanding:',
    options: ['How things work.', 'Why people behave the way they do.', 'How to build a successful business.', 'How to express ideas visually.'],
  },
  {
    category: 'interests',
    text: 'Which of these would you rather do?',
    options: ['Write a short story.', 'Build a financial model.', 'Conduct a scientific experiment.', 'Organize a community event.'],
  },
  {
    category: 'interests',
    text: 'Which topic would you most like to learn more about?',
    options: ['The history of art.', 'The latest advancements in AI.', 'The principles of economics.', 'The impact of social media on society.'],
  },
  {
    category: 'interests',
    text: 'You are drawn to careers that involve:',
    options: ['Creativity and self-expression.', 'Logic and problem-solving.', 'Leadership and strategy.', 'Empathy and helping others.'],
  },
  {
    category: 'interests',
    text: 'What type of content do you enjoy creating?',
    options: ['Visual art or music.', 'Code or software.', 'Business plans or reports.', 'Educational or informative articles.'],
  },
  {
    category: 'interests',
    text: 'You find satisfaction in:',
    options: ['Bringing an idea to life.', 'Finding the optimal solution to a problem.', 'Achieving a financial goal.', 'Making a positive impact on someone\'s life.'],
  },
];


export default function TestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null));
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const calculateScores = () => {
    const scores = {
      aptitude: 0,
      personality: 0,
      interests: 0,
    };
    answers.forEach((answer, index) => {
      if (answer !== null) {
        const question = questions[index];
        // simple scoring: add 1 for any answer
        scores[question.category as keyof typeof scores] += 1;
      }
    });
    // Normalize to a scale of 100
    scores.aptitude = scores.aptitude * 10;
    scores.personality = scores.personality * 10;
    scores.interests = scores.interests * 10;

    return scores;
  };

  const handleSubmit = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit the test.",
        });
        return;
    }

    setIsSubmitting(true);
    const scores = calculateScores();
    
    // Initial data, recommendations will be added later
    const testResultData = {
        userId: user.uid,
        scores,
        recommendedCareers: [], // To be updated by AI
        timestamp: serverTimestamp(),
        answers,
    };
    
    try {
        const testResultsCollection = collection(firestore, 'users', user.uid, 'testResults');
        const docRef = await addDoc(testResultsCollection, testResultData);

        const userDocRef = doc(firestore, 'users', user.uid);
        // This is a non-blocking update
        setDocumentNonBlocking(userDocRef, { testsCompleted: 1 }, { merge: true });

        // Now, call the AI to get recommendations
        try {
            const reportInput = {
                testScores: scores,
                // Provide empty/dummy data for resume and chat as they are not required for this step
                resumeAnalysis: { skills: [], atsScore: 0, missingSkills: [] },
                chatInsights: 'N/A',
            };
            const aiResult = await generateCareerReport(reportInput);
            const parsedReport = JSON.parse(aiResult.report);
            const recommendedCareers = parsedReport.careerMatches.map((match: any) => match.name);
            
            // Update the document with the AI recommendations
            await updateDoc(docRef, { recommendedCareers });

        } catch (aiError) {
            console.error("AI recommendation generation failed:", aiError);
            // The test is saved, but recommendations failed. We can inform the user.
             toast({
                variant: "destructive",
                title: "AI Analysis Failed",
                description: "Your test was saved, but we couldn't generate AI recommendations right now.",
            });
        }

        toast({
            title: "Test Submitted!",
            description: "Your results and AI recommendations have been saved.",
        });
        setIsCompleted(true);
        setTimeout(() => router.push('/dashboard'), 2000);
        
    } catch (e: any) {
        console.error("Error submitting test results:", e);
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: `users/${user.uid}/testResults`,
            requestResourceData: testResultData,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not save your test results. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isCompleted) {
    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Test Completed!</h2>
            <p className="text-muted-foreground">Thank you for completing the assessment. Redirecting you...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/20 bg-primary/10 p-2">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Career Assessment Test</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <CardDescription>Answer the questions to get personalized career recommendations.</CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="my-8">
            <p className="mb-6 text-lg font-semibold">{currentQuestion.text}</p>
            <RadioGroup
              value={answers[currentQuestionIndex] || ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-md border border-border p-4 transition-all hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                  <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                  <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0 || isSubmitting}>
            Back
          </Button>
          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={answers.some(a => a === null) || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Answers'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={answers[currentQuestionIndex] === null}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
