'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bike, Car, Shield, Zap, Clock, Star, 
  MapPin, CheckCircle2, ArrowRight, Play,
  Users, TrendingUp, Award, Smartphone
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const stats = [
    { label: 'Happy Renters', value: '10k+', icon: Users },
    { label: 'Verified Vehicles', value: '500+', icon: Bike },
    { label: 'Cities Covered', value: '15+', icon: MapPin },
    { label: 'User Rating', value: '4.9/5', icon: Star },
  ];

  const features = [
    {
      title: 'Verified Owners',
      description: 'Every vehicle and owner on our platform undergoes a rigorous verification process for your safety.',
      icon: Shield,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Instant Booking',
      description: 'Find, book, and unlock your ride in minutes. No paperwork, no queues, just ride.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: '24/7 Support',
      description: 'Our dedicated support team is always available to help you with any issues during your rental.',
      icon: Clock,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Mobile First',
      description: 'Manage your entire rental experience from our mobile-friendly web app anytime, anywhere.',
      icon: Smartphone,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const categories = [
    {
      name: 'Premium Bikes',
      count: '240+ Available',
      image: '/hero-bike.png',
      link: '/browse?type=bike'
    },
    {
      name: 'Luxury Cars',
      count: '120+ Available',
      image: '/category-car.png',
      link: '/browse?type=car'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/10 selection:text-primary">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -z-10 rounded-l-[100px] hidden lg:block" />
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest">
                  The Future of Mobility
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-8">
                  Ride the <span className="text-primary">Extraordinary.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Experience the ultimate freedom of movement. From high-performance bikes to luxury SUVs, find the perfect ride for every journey.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 px-10 rounded-2xl text-base font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={() => router.push('/browse')}
                  >
                    Explore Vehicles <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl text-base font-bold hover:bg-slate-50"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" /> How it Works
                  </Button>
                </div>
                
                {/* Trust Elements */}
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" width={40} height={40} />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex text-amber-500 mb-0.5">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trusted by 10k+ Riders</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
                  <Image 
                    src="/hero-bike.png" 
                    alt="Premium Ride" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Floating Elements */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-2xl flex items-center gap-4 animate-bounce-slow">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Daily Savings</p>
                        <p className="text-lg font-black text-slate-900">Up to 40% Cheaper</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-slate-900 rounded-[40px] p-10 lg:p-16 flex flex-wrap justify-center gap-12 lg:justify-between items-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ED6140 0%, transparent 50%)' }} />
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                    <stat.icon size={24} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{stat.value}</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black mb-6 tracking-tight">Built for Your <span className="text-primary">Peace of Mind.</span></h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                We've obsessed over every detail to ensure your rental experience is safe, smooth, and enjoyable from start to finish.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <Card key={i} className="p-8 rounded-[32px] border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Category Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="text-left">
                <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">Browse by <span className="text-primary">Category.</span></h2>
                <p className="text-lg text-slate-600 max-w-xl font-medium">Choose from our curated selection of high-quality vehicles.</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary font-black text-base hover:bg-primary/5 group"
                onClick={() => router.push('/browse')}
              >
                View All Vehicles <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((cat, i) => (
                <Link key={i} href={cat.link} className="group relative h-[400px] rounded-[40px] overflow-hidden shadow-xl">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-primary font-black text-sm uppercase tracking-[0.2em] mb-2">{cat.count}</p>
                    <h3 className="text-4xl font-black mb-6">{cat.name}</h3>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1 w-full order-2 lg:order-1">
                <div className="space-y-12">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">1</div>
                    <div>
                      <h4 className="text-2xl font-black mb-3">Find Your Ride</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">Search from hundreds of available vehicles near your location with our interactive map.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">2</div>
                    <div>
                      <h4 className="text-2xl font-black mb-3">Book Instantly</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">Select your dates, complete the payment securely, and get immediate confirmation from the owner.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">3</div>
                    <div>
                      <h4 className="text-2xl font-black mb-3">Pick Up & Enjoy</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">Meet the owner or use remote access to unlock your ride. Start your journey and have fun!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Award className="text-amber-500" size={32} />
                  </div>
                  <div>
                    <h5 className="font-black text-lg">Owner? Earn Extra Cash</h5>
                    <p className="text-slate-500 font-medium text-sm">List your vehicle and start earning up to ৳30,000/month.</p>
                    <Link href="/signup?role=owner" className="text-primary font-bold text-sm mt-2 inline-block hover:underline">List your vehicle →</Link>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left order-1 lg:order-2">
                <Badge className="mb-6 bg-secondary text-white font-black uppercase tracking-widest px-4 py-1.5 rounded-full">3 Easy Steps</Badge>
                <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">Your Next Adventure is Just <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-8">Clicks Away.</span></h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8">
                  We've simplified the entire process so you can focus on the ride, not the paperwork. Renting has never been this easy.
                </p>
                <Button 
                  size="lg" 
                  className="h-14 px-10 rounded-2xl text-base font-black shadow-xl"
                  onClick={() => router.push('/signup')}
                >
                  Join MotoRent Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-5xl font-black mb-6">Loved by Thousands of <span className="text-primary">Riders.</span></h2>
              <div className="flex items-center justify-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" />)}
                <span className="ml-2 text-white font-bold text-xl">4.9/5 Average</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Arif Ahmed', role: 'Business Traveler', text: 'MotoRent saved my trip! Finding a premium bike in minutes was exactly what I needed for my commute in Dhaka.' },
                { name: 'Sarah Kabir', role: 'Weekend Explorer', text: 'The SUV we rented for our family trip was in perfect condition. The owner was super helpful and the process was seamless.' },
                { name: 'Tanvir Hasan', role: 'Vehicle Owner', text: 'Listing my spare bike on MotoRent has been a great source of passive income. The insurance and verification give me peace of mind.' }
              ].map((t, i) => (
                <Card key={i} className="p-8 rounded-[32px] bg-white/5 border-white/10 backdrop-blur-xl text-white">
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-lg font-medium mb-8 leading-relaxed opacity-90">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                      <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} width={48} height={48} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{t.name}</p>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Trust */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-green-500 text-white font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Safety First</Badge>
                <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">Your Protection is Our <span className="text-primary">Priority.</span></h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary shrink-0">
                      <Shield size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">Comprehensive Insurance</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">Every ride is covered by our partner insurance providers, protecting both owners and renters from any accidental damage.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary shrink-0">
                      <Users size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">Verified Community</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">We verify every user's identity through government ID checks and facial recognition technology.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary shrink-0">
                      <Clock size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">24/7 Roadside Assistance</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">Stuck on the road? Our support team and roadside assistance partners are just a tap away, anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white p-4 rounded-[40px] shadow-2xl relative z-10">
                  <div className="relative aspect-square rounded-[30px] overflow-hidden">
                    <Image src="/category-car.png" alt="Safety" fill className="object-cover" />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black mb-6 tracking-tight">Frequently Asked <span className="text-primary">Questions.</span></h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Everything you need to know about the MotoRent platform.</p>
            </div>
            <div className="max-w-3xl mx-auto grid gap-6">
              {[
                { q: "How do I start renting?", a: "Simply sign up, verify your ID, browse available vehicles, and book your preferred ride. It's that simple!" },
                { q: "What are the requirements to rent?", a: "You must be at least 18 years old, have a valid driving license, and complete our identity verification process." },
                { q: "How does insurance work?", a: "We provide comprehensive insurance coverage for every rental. The cost is included in your booking fee." },
                { q: "Can I list my own vehicle?", a: "Yes! If you own a well-maintained vehicle, you can sign up as an owner and start earning income today." }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer">
                  <h4 className="text-xl font-black mb-3 flex justify-between items-center">
                    {faq.q}
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[50px] p-12 lg:p-24 text-center text-white relative shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-7xl font-black mb-8 leading-tight tracking-tighter">Ready to Hit the <br /> <span className="underline decoration-white/20">Open Road?</span></h2>
                <p className="text-xl lg:text-2xl mb-12 max-w-2xl mx-auto font-medium opacity-90">
                  Join thousands of riders and vehicle owners in Bangladesh's premier vehicle sharing community.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="h-16 px-12 rounded-2xl text-lg font-black bg-white text-primary hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
                    onClick={() => router.push('/signup')}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-16 px-10 rounded-2xl text-lg font-bold border-white/40 text-white hover:bg-white/10"
                    onClick={() => router.push('/browse')}
                  >
                    Browse Vehicles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="bg-primary text-white p-2.5 rounded-2xl shadow-lg">
                  <Bike size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-medium tracking-[-0.03em] leading-none">MotoRent</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-0.5">Bangladesh</span>
                </div>
              </Link>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm mb-8">
                Bangladesh's premier peer-to-peer vehicle rental platform. We're on a mission to make mobility accessible, sustainable, and enjoyable for everyone.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">
                    <CheckCircle2 size={20} />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-8">Platform</h5>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Vehicles</Link></li>
                <li><Link href="/home" className="hover:text-primary transition-colors">Interactive Map</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
                <li><Link href="/insurance" className="hover:text-primary transition-colors">Insurance Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-8">Company</h5>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & News</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-8">Trust & Safety</h5>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Center</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">© 2026 MotoRent Bangladesh. All Rights Reserved.</p>
            <div className="flex gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> System Operational</span>
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
