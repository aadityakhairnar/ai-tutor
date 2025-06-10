import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';

const Landing = () => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Personalized Learning",
      description: "AI-powered content generation tailored to your learning style and preferences"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Flashcards",
      description: "Generate and study with intelligent flashcards that adapt to your progress"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Interactive Tests",
      description: "Take customized tests to reinforce your understanding and track progress"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations and insights to optimize your learning"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="flex-1 text-center lg:text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl lg:text-6xl font-display font-bold mb-6">
                  Transform Your Learning Journey with AI
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Experience personalized education powered by artificial intelligence. Generate custom courses, interactive content, and smart study materials tailored to your needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/20 to-amber-800/20 p-8">
               <img
                 src="/landing.png"
                 alt="AI-powered learning platform"
                 className="w-full h-full object-cover rounded-xl"
               />
               </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-display font-bold mb-4">
                Powerful Features for Better Learning
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge AI technology with proven learning methods to create an exceptional educational experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-display font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of students who are already experiencing the future of education.
              </p>
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Landing; 