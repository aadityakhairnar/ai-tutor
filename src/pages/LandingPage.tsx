
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, PenLine, RefreshCw } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Learn Smarter with <span className="text-primary">acampus<span className="text-accent-foreground">ai</span></span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Personalized learning experiences powered by AI to help you master any subject
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link to="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-12">Why Choose acampusai?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
                <p className="text-muted-foreground">
                  Engage with content that adapts to your learning style and pace.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <PenLine className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Feedback</h3>
                <p className="text-muted-foreground">
                  Get real-time feedback and suggestions to improve your understanding.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Spaced Repetition</h3>
                <p className="text-muted-foreground">
                  Review concepts at optimal intervals to ensure long-term retention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <p className="italic mb-4">
                  "acampusai has completely transformed how I study. The AI tutor feels like having a personal teacher available 24/7."
                </p>
                <p className="font-medium">Sarah T., Computer Science Student</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <p className="italic mb-4">
                  "I've tried many learning platforms, but nothing compares to the personalized experience acampusai provides."
                </p>
                <p className="font-medium">Michael R., Self-taught Developer</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of students who are learning faster and more effectively with acampusai.
            </p>
            <Link to="/sign-up">
              <Button size="lg">Start Learning Today</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-display text-xl text-primary font-semibold">acampus<span className="text-accent-foreground">ai</span></p>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} acampusai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
