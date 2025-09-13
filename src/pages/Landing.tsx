import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, CheckCircle, Users, Calculator, BarChart3 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Wedding Ledger</h1>
              <Sparkles className="h-5 w-5 text-primary-glow" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="elegant" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              अपनी परफेक्ट शादी का
              <span className="block bg-gradient-rose bg-clip-text text-transparent">
                बजट ट्रैकर
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              शादी के हर खर्च को आसानी से ट्रैक करें। अपने बजट में रहें, 
              पेमेंट्स मैनेज करें और अपनी ड्रीम शादी को हकीकत बनाएं।
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="elegant" asChild className="min-w-[200px]">
                <Link to="/auth">शुरू करें - बिल्कुल फ्री!</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[200px]">
                <Link to="/auth">लॉगिन करें</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Heart className="h-8 w-8 text-primary" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              पूरी शादी की मैनेजमेंट सर्विसेज
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              छोटी इंटिमेट सेरेमनी से लेकर ग्रैंड डेस्टिनेशन वेडिंग तक - हमारी कंप्लीट 
              वेडिंग मैनेजमेंट सर्विस। पूरी ट्रांसपैरेंसी और बजट कंट्रोल के साथ।
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-xl bg-card border border-primary/20 shadow-card hover:shadow-elegant transition-all duration-300 hover:border-primary/40">
              <div className="p-4 rounded-full bg-gradient-rose w-fit mx-auto mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">डेस्टिनेशन वेडिंग</h3>
              <p className="text-muted-foreground leading-relaxed">
                हमारी एक्सपर्ट टीम के साथ अपनी ड्रीम डेस्टिनेशन वेडिंग प्लान करें। 
                वेन्यू सेलेक्शन से गेस्ट मैनेजमेंट तक - सब कुछ आपके बजट में।
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-card border border-primary/20 shadow-card hover:shadow-elegant transition-all duration-300 hover:border-primary/40">
              <div className="p-4 rounded-full bg-gradient-primary w-fit mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">ईवेंट मैनेजमेंट</h3>
              <p className="text-muted-foreground leading-relaxed">
                प्री-वेडिंग सेरेमनी से रिसेप्शन तक फुल-सर्विस ईवेंट मैनेजमेंट। 
                प्रोफेशनल कोऑर्डिनेशन - हर पल को परफेक्ट बनाने के लिए।
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-card border border-primary/20 shadow-card hover:shadow-elegant transition-all duration-300 hover:border-primary/40 md:col-span-2 lg:col-span-1">
              <div className="p-4 rounded-full bg-gradient-elegant w-fit mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">कंप्लीट वेडिंग पैकेज</h3>
              <p className="text-muted-foreground leading-relaxed">
                ऑल-इनक्लूसिव पैकेज जिसमें शादी का हर एस्पेक्ट कवर है - वेन्यू, कैटरिंग, 
                डेकोरेशन, फोटोग्राफी और बहुत कुछ। एक पैकेज, सब कुछ कवर।
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto p-8 rounded-xl bg-card border border-primary/30 shadow-elegant">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Planning?</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Save your wedding details and our dedicated sales team will reach out to discuss 
                your perfect wedding package. Get confirmed bookings with complete transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="elegant" asChild>
                  <Link to="/auth">Book Your Wedding</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">Get Free Consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Your Wedding Budget
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From venue deposits to flower arrangements, keep track of every expense 
              with our beautiful and intuitive wedding ledger.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-card border border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto mb-4">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Expense Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Categorize expenses, track payments, and get real-time insights into your wedding budget.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Shared Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Collaborate with your partner and wedding party to manage expenses together seamlessly.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Beautiful Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize your spending patterns with elegant charts and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Wedding Ledger?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Stay Within Budget</h3>
                    <p className="text-muted-foreground">Never overspend again with real-time budget tracking and alerts.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Elegant Design</h3>
                    <p className="text-muted-foreground">Beautiful interface designed specifically for couples planning their special day.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Secure & Private</h3>
                    <p className="text-muted-foreground">Your wedding plans and financial data are kept safe and secure.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Easy Setup</h3>
                    <p className="text-muted-foreground">Get started in minutes with our intuitive setup wizard.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 rounded-lg bg-gradient-rose text-center">
                <Heart className="h-16 w-16 text-white mx-auto mb-6 opacity-90" />
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Planning?</h3>
                <p className="text-white/90 mb-6">Join thousands of couples who trust Wedding Ledger for their special day.</p>
                <Button size="lg" variant="wedding" asChild>
                  <Link to="/auth">Create Your Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/50 border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Wedding Ledger</span>
            <Sparkles className="h-4 w-4 text-primary-glow" />
          </div>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for couples planning their perfect wedding day
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;