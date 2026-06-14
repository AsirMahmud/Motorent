import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { Header } from '@/components/header';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

const steps = [
  {
    number: '01',
    title: 'Find the right ride',
    description: 'Search verified bikes and cars by location, date, and budget.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Book with confidence',
    description: 'Compare clear pricing, real ratings, and live availability.',
    icon: CalendarDays,
  },
  {
    number: '03',
    title: 'Pick up and move',
    description: 'Meet your verified owner, collect the vehicle, and enjoy the road.',
    icon: Bike,
  },
];

const benefits = [
  {
    title: 'Verified community',
    description: 'Identity checks, vehicle documents, and real profiles build trust into every trip.',
    icon: BadgeCheck,
  },
  {
    title: 'Transparent pricing',
    description: 'See the rate before you book. No roadside bargaining and no surprise platform fees.',
    icon: WalletCards,
  },
  {
    title: 'Support that stays close',
    description: 'Trip records, in-app messages, and rental tracking keep everyone connected.',
    icon: ShieldCheck,
  },
];

const partnerBenefits = [
  'Reach verified renters near your location',
  'Manage requests, messages, and availability',
  'Track fleet performance from one dashboard',
  'Turn idle vehicles into steady income',
];

async function getFeaturedVehicles() {
  try {
    return await db.vehicle.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        category: true,
        brand: true,
        model: true,
        location: true,
        dailyRate: true,
        vehiclePhotoUrl: true,
        features: true,
        bookings: {
          where: { status: 'ACCEPTED', returnedAt: null },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });
  } catch (error) {
    console.error('Unable to load featured vehicles', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredVehicles = await getFeaturedVehicles();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="relative overflow-hidden pb-20 pt-12 sm:pt-16 lg:pb-28 lg:pt-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_4%,rgba(5,201,106,0.16),transparent_32%),radial-gradient(circle_at_4%_48%,rgba(6,62,86,0.09),transparent_28%)]" />
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 sm:px-7 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Bangladesh&apos;s First Vehicle Rental Marketplace
              </div>
              <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-[-0.045em] text-primary sm:text-6xl lg:text-[5rem]">
                Rent any vehicle.
                <span className="block text-secondary">Move freely.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Book trusted bikes and cars nearby, or list your own fleet and earn more from every idle day.
              </p>

              <div className="mt-8 max-w-2xl rounded-[1.75rem] border border-primary/10 bg-white p-3 shadow-[0_24px_70px_rgba(6,62,86,0.14)]">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Link href="/home" className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-muted">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">View map</span>
                      <span className="text-sm font-semibold text-primary">Vehicles around Dhaka</span>
                    </span>
                  </Link>
                  <Link href="/browse#rental-dates" className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-muted">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Rental period</span>
                      <span className="text-sm font-semibold text-primary">Choose your dates</span>
                    </span>
                  </Link>
                  <Link
                    href="/browse"
                    aria-label="Search vehicles"
                    className="flex min-h-14 items-center justify-center rounded-2xl bg-secondary px-5 text-[#022b14] shadow-[0_10px_24px_rgba(5,201,106,0.28)] transition hover:-translate-y-0.5 hover:bg-[#04b85f]"
                  >
                    <Search className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/browse" className="brand-button brand-button-primary">
                  Browse vehicles <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/signup" className="brand-button brand-button-outline">
                  List your vehicle
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Verified owners</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-secondary text-secondary" /> 4.9 average rating</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-muted shadow-[0_28px_80px_rgba(6,62,86,0.18)]">
                <Image
                  src="/hero-motorent.jpg"
                  alt="A white car with the MotoRent logo and a hand holding a smartphone showing the MotoRent app"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Available nearby</p>
                    <p className="font-display mt-1 text-3xl font-medium">Your next ride</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-2 text-xs font-bold text-[#022b14]">Book now</span>
                </div>
              </div>
              <div className="absolute -left-5 bottom-20 hidden items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_18px_45px_rgba(6,62,86,0.18)] sm:flex">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/12 text-secondary"><TrendingUp /></span>
                <span><small className="block text-xs text-muted-foreground">Partner potential</small><b className="text-primary">Earn from idle days</b></span>
              </div>
              <div className="absolute -right-4 top-8 hidden rounded-2xl bg-white p-4 shadow-[0_18px_45px_rgba(6,62,86,0.18)] sm:block">
                <span className="flex items-center gap-2 text-sm font-bold text-primary"><span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Verified listing</span>
                <small className="mt-1 block text-muted-foreground">Documents reviewed</small>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-8 sm:px-7">
          <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[2rem] shadow-[0_20px_55px_rgba(6,62,86,0.12)] md:grid-cols-2">
            <div className="bg-primary p-9 text-white sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">For renters</p>
              <h2 className="font-display mt-5 text-4xl font-medium">Your next ride is nearby.</h2>
              <p className="mt-4 max-w-md leading-7 text-white/65">Browse verified vehicles and book in minutes.</p>
              <Link href="/browse" className="brand-button mt-8 bg-white text-primary hover:-translate-y-0.5">Rent a vehicle <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="bg-secondary p-9 text-[#022b14] sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">For partners</p>
              <h2 className="font-display mt-5 text-4xl font-medium">Put your fleet to work.</h2>
              <p className="mt-4 max-w-md leading-7 text-primary/75">Join the marketplace and grow with better fleet tools.</p>
              <Link href="/signup" className="brand-button mt-8 bg-primary text-white hover:-translate-y-0.5">Become a partner <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="border-y border-primary/10 bg-white py-7">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-7 px-5 sm:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Built for everyday movement</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 font-display text-lg font-semibold text-primary/45">
              <span>Verified vehicles</span><span>Secure booking</span><span>Live tracking</span><span>Local support</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-muted py-20 lg:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
            <div className="max-w-2xl">
              <p className="brand-eyebrow">How it works</p>
              <h2 className="brand-heading mt-4">From search to road in <span>three simple steps.</span></h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">A clear booking flow for renters and a focused operating system for vehicle owners.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="brand-card group p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white"><step.icon className="h-5 w-5" /></span>
                    <span className="font-display text-3xl font-semibold text-primary/12">{step.number}</span>
                  </div>
                  <h3 className="font-display mt-8 text-2xl font-medium text-primary">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="brand-eyebrow">Choose your ride</p>
                <h2 className="brand-heading mt-4">A vehicle for <span>every plan.</span></h2>
              </div>
              <Link href="/browse" className="brand-button brand-button-outline self-start">View all vehicles <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { name: 'Bikes & scooters', text: 'Quick commutes, weekend rides, and efficient city movement.', image: '/hero-bike-v2.png', icon: Bike, href: '/browse?type=bike' },
                { name: 'Cars & SUVs', text: 'Comfortable family trips, business travel, and longer journeys.', image: '/category-car.png', icon: Car, href: '/browse?type=car' },
              ].map((category) => (
                <Link key={category.name} href={category.href} className="group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-primary shadow-[0_20px_55px_rgba(6,62,86,0.12)]">
                  <Image src={category.image} alt={category.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9">
                    <div>
                      <category.icon className="mb-5 h-7 w-7 text-secondary" />
                      <h3 className="font-display text-3xl font-medium">{category.name}</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-white/75">{category.text}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-[#022b14] transition group-hover:translate-x-1"><ArrowRight /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {featuredVehicles.length > 0 ? (
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <p className="brand-eyebrow">Available now</p>
                  <h2 className="brand-heading mt-4">Real vehicles from <span>MotoRent partners.</span></h2>
                  <p className="mt-4 text-muted-foreground">These approved listings are loaded directly from the MotoRent database.</p>
                </div>
                <Link href="/browse" className="brand-button brand-button-outline self-start">Browse all <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredVehicles.map((vehicle) => {
                  const onRental = vehicle.bookings.length > 0;
                  return (
                    <Link key={vehicle.id} href={`/vehicle/${vehicle.id}`} className="brand-card group overflow-hidden">
                      <div className="relative aspect-[4/3] overflow-hidden bg-white">
                        <Image
                          src={vehicle.vehiclePhotoUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm">
                          {vehicle.category === 'CAR' ? 'Car' : 'Bike'}
                        </span>
                        <span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-bold ${onRental ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-secondary-foreground'}`}>
                          {onRental ? 'On rental' : 'Available'}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-xl font-medium text-primary">{vehicle.brand} {vehicle.model}</h3>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-secondary" /> {vehicle.location}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {vehicle.features.slice(0, 2).map((feature) => (
                            <span key={feature} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-primary">{feature}</span>
                          ))}
                        </div>
                        <div className="mt-5 flex items-end justify-between border-t border-primary/10 pt-4">
                          <p className="font-display text-2xl font-semibold text-primary">৳{vehicle.dailyRate.toLocaleString()}<span className="font-sans text-xs font-medium text-muted-foreground"> / day</span></p>
                          <ArrowRight className="h-5 w-5 text-secondary transition group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-primary py-20 text-white lg:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
            <div className="max-w-2xl">
              <p className="brand-eyebrow text-secondary before:bg-secondary">Why MotoRent</p>
              <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Built on trust, not guesswork.</h2>
              <p className="mt-5 text-lg leading-8 text-white/65">Everything important stays visible, documented, and easy to manage.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-[#022b14]"><benefit.icon /></span>
                  <h3 className="font-display mt-7 text-2xl font-medium">{benefit.title}</h3>
                  <p className="mt-3 leading-7 text-white/60">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="partners" className="py-20 lg:py-28">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 sm:px-7 lg:grid-cols-2 lg:gap-20">
            <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-muted">
              <Image src="/category-car.png" alt="Vehicle owner listing a car on MotoRent" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/65 to-transparent" />
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary"><Users /></span>
                  <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">One partner dashboard</p><p className="font-display text-xl font-medium text-primary">Bookings, fleet, and income together</p></div>
                </div>
              </div>
            </div>
            <div>
              <p className="brand-eyebrow">Become a partner</p>
              <h2 className="brand-heading mt-4">Turn idle vehicles into <span>steady income.</span></h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">List your bike or car, reach verified renters, and run the whole rental journey from one simple dashboard.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {partnerBenefits.map((item) => (
                  <div key={item} className="flex gap-3 text-sm font-medium leading-6 text-primary">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"><Check className="h-3.5 w-3.5" /></span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/signup" className="brand-button brand-button-primary">List your vehicle <ArrowRight className="h-4 w-4" /></Link>
                <span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="h-4 w-4 text-secondary" /> Free to apply</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#042f42] py-12 text-white">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-10 px-5 sm:px-7 md:flex-row">
          <div className="max-w-sm">
            <div className="inline-flex rounded-xl bg-primary p-2.5">
              <Image src="/White & Light Green Logo EN.svg" alt="MotoRent" width={170} height={53} className="h-10 w-auto" />
            </div>
            <p className="mt-5 text-sm leading-7 text-white/55">Bangladesh&apos;s vehicle renting and fleet management platform. Move freely without the burden of ownership.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-5 text-sm sm:grid-cols-3">
            <div><p className="mb-4 font-bold text-secondary">Rent</p><Link className="block py-1.5 text-white/60 hover:text-white" href="/browse">Browse vehicles</Link><Link className="block py-1.5 text-white/60 hover:text-white" href="/home">Explore map</Link></div>
            <div><p className="mb-4 font-bold text-secondary">Partner</p><Link className="block py-1.5 text-white/60 hover:text-white" href="/signup">List a vehicle</Link><Link className="block py-1.5 text-white/60 hover:text-white" href="/login/owner">Owner login</Link></div>
            <div>
              <p className="mb-4 font-bold text-secondary">Contact</p>
              <a className="flex items-center gap-2 py-1.5 text-white/60 hover:text-white" href="mailto:support@motorent.com"><Mail className="h-3.5 w-3.5" /> support@motorent.com</a>
              <a className="flex items-center gap-2 py-1.5 text-white/60 hover:text-white" href="tel:+8801768969135"><Phone className="h-3.5 w-3.5" /> +880 176-8969135</a>
              <p className="flex items-center gap-2 py-1.5 text-white/60"><MapPin className="h-3.5 w-3.5" /> Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1240px] border-t border-white/10 px-5 pt-7 text-xs text-white/40 sm:px-7">© 2026 MotoRent. All rights reserved.</div>
      </footer>
    </div>
  );
}
