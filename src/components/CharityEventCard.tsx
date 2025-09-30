import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Heart, Users } from 'lucide-react';
import { CharityEvent } from '../types';
import { calculateProgress, formatAPT, getTimeRemaining } from '../mockData';

interface CharityEventCardProps {
  event: CharityEvent;
  featured?: boolean;
}

const CharityEventCard: React.FC<CharityEventCardProps> = ({ event, featured = false }) => {
  const progress = calculateProgress(event.totalDonated, event.goalAmount);
  const timeRemaining = getTimeRemaining(event.endTimestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`card-garden overflow-hidden ${featured ? 'lg:col-span-2' : ''}`}
    >
      <Link to={`/event/${event.eventAddress}`} className="block">
        <div className="relative">
          <img
            src={event.imageUrl}
            alt={event.eventName}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Time remaining badge */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="w-3 h-3 text-primary" />
              <span className="font-nunito font-medium text-foreground">{timeRemaining}</span>
            </div>
          </div>

          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span className="font-nunito font-semibold">{Math.round(progress)}% funded</span>
              <span className="font-nunito">
                {formatAPT(event.totalDonated)} / {formatAPT(event.goalAmount)} APT
              </span>
            </div>
            
            {/* Custom vine-like progress bar */}
            <div className="progress-vine">
              <motion.div
                className="progress-vine-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-nunito text-xl font-bold text-foreground mb-1 line-clamp-2">
              {event.eventName}
            </h3>
            <p className="text-sm text-primary font-nunito font-medium">
              {event.charityName}
            </p>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-4 leading-relaxed">
            {event.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{Math.floor(event.totalDonated / 50)} donors</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-primary">❤️</span>
                <span>{event.milestones.filter(m => m.isClaimed).length} milestones</span>
              </div>
            </div>

            <motion.div
              className="btn-garden-secondary !px-6 !py-2 !text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Donate Now
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CharityEventCard;