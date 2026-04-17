'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, Car, Bike, MapPin, CheckCircle2, XCircle, Clock,
  MessageSquare, Phone, Plus, BarChart2, TrendingUp, Activity,
  AlertCircle, ShieldCheck, Eye, Star, Users, Map as MapIcon,
  ChevronRight, Calendar
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { currentUser, vehicles, bookings, users, updateBooking } = useApp();

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="p-10 text-center max-w-sm rounded-3xl shadow-2xl border-none">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={40} />
            <h2 className="text-2xl font-black mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Log in as an owner to access this dashboard.</p>
            <Button onClick={() => router.push('/login')} className="rounded-xl px-8 h-12 font-black">Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  const myVehicles = vehicles.filter(v => v.ownerId === currentUser.id);
  const myBookingRequests = bookings.filter(b => myVehicles.some(v => v.id === b.vehicleId));
  const earned = myBookingRequests.filter(b => b.status === 'accepted' || b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0);
  const pendingRequests = myBookingRequests.filter(b => b.status === 'pending');
  const activeRequests = myBookingRequests.filter(b => b.status === 'accepted');
  const totalRatings = myVehicles.reduce((s, v) => s + v.rating, 0);
  const avgRating = myVehicles.length ? (totalRatings / myVehicles.length).toFixed(1) : '0';

  const handleApprove = (bookingId: string) => updateBooking(bookingId, { status: 'accepted' });
  const handleReject = (bookingId: string) => updateBooking(bookingId, { status: 'rejected' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 md:pb-12">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Owner Hub</h1>
            <p className="text-muted-foreground">Hello, <span className="font-bold text-foreground">{currentUser.name}</span> — Manage your fleet.</p>
          </div>
          <Button className="h-11 px-6 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20" onClick={() => router.push('/owner-dashboard/add-vehicle')}>
            <Plus size={16} /> List New Vehicle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Fleet Size', value: myVehicles.length, icon: Car, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Earned', value: `৳${earned.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
            { label: 'Pending Requests', value: pendingRequests.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Avg Rating', value: avgRating, icon: Star, color: 'bg-primary/10 text-primary' },
          ].map((stat, i) => (
            <Card key={i} className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-white rounded-2xl p-1.5 h-auto gap-1 shadow-sm border border-border/50 flex-wrap">
            {[
              { value: 'requests', label: 'Booking Requests', badge: pendingRequests.length },
              { value: 'fleet', label: 'My Fleet', badge: myVehicles.length },
              { value: 'map', label: 'Map View', badge: null },
              { value: 'finance', label: 'Finance', badge: null },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="rounded-xl px-4 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-sm flex items-center gap-1.5">
                {tab.label}
                {tab.badge !== null && tab.badge! > 0 && (
                  <span className="w-4 h-4 bg-primary/20 rounded-full text-[10px] flex items-center justify-center font-black">{tab.badge}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Booking Requests */}
          <TabsContent value="requests" className="space-y-4 animate-in fade-in duration-300">
            {pendingRequests.length === 0 && activeRequests.length === 0 ? (
              <Card className="p-12 text-center border-none shadow-sm bg-white rounded-3xl">
                <CheckCircle2 className="w-12 h-12 text-green-200 mx-auto mb-3" />
                <p className="font-black text-lg">All Clear!</p>
                <p className="text-muted-foreground text-sm">No pending booking requests.</p>
              </Card>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">⏳ Awaiting Your Response ({pendingRequests.length})</p>
                    <div className="space-y-4">
                      {pendingRequests.map(booking => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        const renter = users.find(u => u.id === booking.renterId);
                        const days = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000);
                        return vehicle && renter ? (
                          <Card key={booking.id} className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 shadow-sm">
                            <div className="flex gap-4">
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-black">{vehicle.brand} {vehicle.model}</h3>
                                  <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-black shrink-0">New Request</Badge>
                                </div>
                                <div className="flex items-center gap-3 mb-1 text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-black">{renter.name.charAt(0)}</div>
                                    <span className="font-bold">{renter.name}</span>
                                  </div>
                                  {renter.kycStatus === 'verified' && <ShieldCheck size={14} className="text-green-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()} · {days} days · <span className="font-bold text-primary">৳{booking.totalPrice.toLocaleString()}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleReject(booking.id)}>
                                    <XCircle size={13} className="mr-1" /> Reject
                                  </Button>
                                  <Button size="sm" className="h-9 rounded-xl text-xs font-black bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200" onClick={() => handleApprove(booking.id)}>
                                    <CheckCircle2 size={13} className="mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold" onClick={() => router.push('/messages')}>
                                    <MessageSquare size={13} className="mr-1" /> Message
                                  </Button>
                                  <a href={`tel:${renter.phone}`}>
                                    <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold">
                                      <Phone size={13} className="mr-1" /> Call
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {activeRequests.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-3 mt-6">✓ Active Rentals ({activeRequests.length})</p>
                    <div className="space-y-3">
                      {activeRequests.map(booking => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        const renter = users.find(u => u.id === booking.renterId);
                        return vehicle && renter ? (
                          <Card key={booking.id} className="p-5 rounded-2xl border-none shadow-sm bg-white flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                              <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-sm">{vehicle.brand} {vehicle.model}</h3>
                              <p className="text-xs text-muted-foreground">{renter.name} · Until {new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold gap-1.5">
                                <MapPin size={12} /> Track
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold" onClick={() => router.push('/messages')}>
                                <MessageSquare size={12} />
                              </Button>
                            </div>
                          </Card>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* My Fleet */}
          <TabsContent value="fleet" className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myVehicles.map(vehicle => {
                const vBookings = myBookingRequests.filter(b => b.vehicleId === vehicle.id);
                const vEarned = vBookings.filter(b => b.status === 'accepted' || b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0);
                return (
                  <Card key={vehicle.id} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="relative h-40">
                      <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <p className="text-white font-black text-sm">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-white/80 text-xs">{vehicle.year} · {vehicle.type}</p>
                        </div>
                        <Badge className={`${vehicle.status === 'approved' ? 'bg-green-500' : vehicle.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'} text-white border-none text-[10px] font-black`}>
                          {vehicle.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Daily</p>
                          <p className="font-black text-sm text-primary">৳{vehicle.priceDaily.toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-border">
                          <p className="text-xs text-muted-foreground">Earned</p>
                          <p className="font-black text-sm text-green-600">৳{vEarned.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-black text-sm">⭐ {vehicle.rating}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${vehicle.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className="text-xs font-bold text-muted-foreground">{vehicle.isAvailable ? 'Available' : 'Currently Rented'}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              <button
                onClick={() => router.push('/owner-dashboard/add-vehicle')}
                className="rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] group"
              >
                <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                  <Plus size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-black text-muted-foreground group-hover:text-foreground transition-colors text-sm">Add New Vehicle</p>
              </button>
            </div>
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map" className="animate-in fade-in duration-300">
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
              <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #cbd5e118 0px, transparent 1px, transparent 50px, #cbd5e118 50px),
                    repeating-linear-gradient(90deg, #cbd5e118 0px, transparent 1px, transparent 50px, #cbd5e118 50px)`,
                }}>
                {/* Road lines */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute top-[40%] left-0 right-0 h-8 bg-gray-400" />
                  <div className="absolute top-0 bottom-0 left-[45%] w-8 bg-gray-400" />
                </div>
                {myVehicles.map((v, i) => (
                  <div
                    key={v.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                    style={{ top: `${25 + i * 22}%`, left: `${20 + i * 18}%`, animationDelay: `${i * 0.3}s`, animationDuration: '3s' }}
                  >
                    <div className={`p-2.5 rounded-2xl shadow-xl border-2 ${v.isAvailable ? 'bg-white border-primary' : 'bg-green-500 border-white'}`}>
                      {v.type === 'bike' ? <Bike size={18} className={v.isAvailable ? 'text-primary' : 'text-white'} /> : <Car size={18} className={v.isAvailable ? 'text-primary' : 'text-white'} />}
                    </div>
                    <div className={`mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black text-center shadow-md ${v.isAvailable ? 'bg-white text-foreground' : 'bg-green-500 text-white'}`}>
                      {v.brand} {v.model.split(' ')[0]}
                    </div>
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow text-xs font-bold">
                    <div className="w-3 h-3 bg-primary rounded-full" /> Available
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow text-xs font-bold">
                    <div className="w-3 h-3 bg-green-500 rounded-full" /> In Use
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {myVehicles.map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${v.isAvailable ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{v.brand} {v.model}</p>
                        <p className="text-[10px] text-muted-foreground">{v.isAvailable ? v.location : 'Currently rented'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Finance */}
          <TabsContent value="finance" className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Revenue', value: `৳${earned.toLocaleString()}`, icon: DollarSign, gradient: 'from-primary to-primary/80' },
                { label: 'Active Earnings', value: `৳${activeRequests.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}`, icon: TrendingUp, gradient: 'from-green-500 to-green-600' },
                { label: 'Bookings', value: myBookingRequests.length, icon: Calendar, gradient: 'from-blue-500 to-blue-600' },
              ].map((item, i) => (
                <Card key={i} className={`p-6 rounded-2xl border-none text-white bg-gradient-to-br ${item.gradient} shadow-lg`}>
                  <item.icon size={20} className="mb-3 opacity-80" />
                  <p className="text-3xl font-black mb-1">{item.value}</p>
                  <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{item.label}</p>
                </Card>
              ))}
            </div>

            {/* Per-Vehicle Earnings */}
            <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Revenue Per Vehicle</h3>
              </div>
              <div className="divide-y divide-border/40">
                {myVehicles.map(vehicle => {
                  const vBookings = myBookingRequests.filter(b => b.vehicleId === vehicle.id);
                  const vEarned = vBookings.filter(b => ['accepted', 'completed'].includes(b.status)).reduce((s, b) => s + b.totalPrice, 0);
                  const pct = earned > 0 ? Math.round((vEarned / earned) * 100) : 0;
                  return (
                    <div key={vehicle.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">{vBookings.length} bookings</p>
                        </div>
                        <p className="font-black text-primary">৳{vEarned.toLocaleString()}</p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{pct}% of total revenue</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-2 flex justify-around items-center z-50 md:hidden">
        {[
          { icon: BarChart2, label: 'Dashboard', href: '/owner-dashboard', active: true },
          { icon: Car, label: 'Fleet', href: '/owner-dashboard' },
          { icon: Plus, label: 'List', href: '/owner-dashboard/add-vehicle' },
          { icon: MessageSquare, label: 'Messages', href: '/messages' },
        ].map(item => (
          <button key={item.label} onClick={() => router.push(item.href)}
            className={`flex flex-col items-center gap-1 transition-colors ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
            <item.icon size={22} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
