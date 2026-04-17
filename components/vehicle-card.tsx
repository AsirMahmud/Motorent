'use client';

import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Fuel, Users, Zap } from 'lucide-react';
import Image from 'next/image';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehicle/${vehicle.id}`}>
      <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] h-full flex flex-col cursor-pointer group bg-white">
        {/* Image Container */}
        <div className="relative w-full h-56 bg-muted overflow-hidden">
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {vehicle.isAvailable ? (
              <Badge className="bg-green-500 text-white border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">Available</Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-500 text-white border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                Rented
              </Badge>
            )}
            <Badge className="bg-white/90 backdrop-blur text-foreground border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm">
              {vehicle.type.toUpperCase()}
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-white text-sm font-bold">{vehicle.rating}</span>
              <span className="text-white/70 text-xs font-medium">({vehicle.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-xl uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                {vehicle.brand} {vehicle.model}
              </h3>
              <span className="text-xs font-black text-muted-foreground/40">{vehicle.year}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
              <MapPin size={14} className="text-primary" />
              {vehicle.location}
            </div>

            {/* Features Row */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Users size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{vehicle.seats} Seats</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Zap size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest capitalize">{vehicle.transmission}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-6 border-t border-border/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Daily Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black italic text-primary">
                  ৳{vehicle.priceDaily.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Zap size={20} className="fill-current" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
