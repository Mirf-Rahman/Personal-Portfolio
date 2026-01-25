import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Quote, Star, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export interface TestimonialData {
  id?: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  rating: number;
  text: string;
  results: string[];
}

interface PremiumTestimonialsProps {
  testimonials?: TestimonialData[];
}

const defaultTestimonials: TestimonialData[] = [
  {
    name: "Sarah Chen",
    role: "CEO, TechFlow Solutions",
    company: "TechFlow",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Lord AI transformed our entire operation. We've seen a 300% increase in efficiency and saved over $2M in operational costs. The autonomous agents work flawlessly.",
    results: ["300% efficiency increase", "$2M cost savings", "24/7 automation"]
  },
  {
    name: "Marcus Johnson",
    role: "CTO, DataDrive Inc",
    company: "DataDrive",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The AI voice agents are revolutionary. Our customer satisfaction increased by 40% while reducing response time from hours to seconds. Incredible ROI.",
    results: ["40% satisfaction boost", "Instant responses", "Seamless integration"]
  }
];

export function PremiumTestimonials({ testimonials = defaultTestimonials }: PremiumTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Safety check for empty array
  const safeTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  useEffect(() => {
    if (safeTestimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % safeTestimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [safeTestimonials.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.23, 0.86, 0.39, 0.96] 
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % safeTestimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + safeTestimonials.length) % safeTestimonials.length);
  };

  const currentTestimonial = safeTestimonials[currentIndex];

  return (
    <section id="testimonials" className="relative py-12 bg-transparent text-white overflow-hidden">
      {/* Background Effects - Simplified to keep original site feel */}
      <div className="absolute inset-0 bg-transparent" />

      <motion.div 
        ref={containerRef}
        className="relative z-10 max-w-7xl mx-auto px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Main Testimonial Display */}
        <div className="relative max-w-6xl mx-auto mb-2">
          <div className="relative min-h-[400px] perspective-1000">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 }
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.1] p-8 md:p-12 overflow-hidden group flex flex-col justify-center">
                  {/* Subtle gradient instead of full colored mesh */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                  {/* Quote icon */}
                  <motion.div
                    className="absolute top-8 right-8 opacity-20"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote className="w-16 h-16 text-white" />
                  </motion.div>

                  <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-8">
                    {/* User Info */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <motion.div
                        className="relative mb-6 inline-block"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-24 h-24 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white/20 relative bg-slate-800 flex items-center justify-center">
                          {currentTestimonial.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={currentTestimonial.avatar} 
                              alt={currentTestimonial.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl font-bold text-white">
                              {currentTestimonial.name.charAt(0)}
                            </span>
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-rose-400/20"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </div>
                        
                        {/* Floating ring animation */}
                        <motion.div
                          className="absolute inset-0 border-2 border-indigo-400/30 rounded-full"
                          animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {currentTestimonial.name}
                      </h3>
                      <p className="text-indigo-300 mb-1 font-medium">
                        {currentTestimonial.role}
                      </p>
                      <p className="text-white/60 mb-4">
                        {currentTestimonial.company}
                      </p>
                      
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <motion.blockquote 
                        className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 font-light italic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                      >
                        &quot;{currentTestimonial.text}&quot;
                      </motion.blockquote>

                      {/* Results */}
                      {currentTestimonial.results && currentTestimonial.results.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {currentTestimonial.results.map((result, i) => (
                            <motion.div
                              key={i}
                              className="bg-white/[0.05] rounded-lg p-3 border border-white/[0.1] backdrop-blur-sm"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            >
                              <span className="text-sm text-white/70 font-medium">
                                {result}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          {safeTestimonials.length > 1 && (
            <div className="flex justify-center items-center gap-6 mt-6">
              <motion.button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              {/* Dots Indicator */}
              <div className="flex gap-3">
                {safeTestimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-indigo-400 scale-125' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              <motion.button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
