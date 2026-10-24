import React from 'react';
import { Phone, MapPin, ShieldAlert, Eye, ShieldCheck } from 'lucide-react';
import { Fisherman } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatPhoneNumber } from '../../utils/formatters';

interface FishermanResultCardProps {
  fisherman: Fisherman;
  onView: (fisherman: Fisherman) => void;
  onBlock: (fisherman: Fisherman) => void;
  onUnblock?: (fisherman: Fisherman) => void;
}

export const FishermanResultCard: React.FC<FishermanResultCardProps> = ({
  fisherman,
  onView,
  onBlock,
  onUnblock,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between">
      <div>
        {/* Top bar with photo, name, and status */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tnnavy-700 to-tnnavy-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
            {fisherman.photo ? (
              <img
                src={fisherman.photo}
                alt={fisherman.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              fisherman.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">{fisherman.name}</h3>
              {fisherman.isBlocked ? (
                <Badge variant="danger" size="sm">
                  BLOCKED
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  ACTIVE
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {fisherman.fishermanId}
              </span>
              <span className="text-xs text-slate-500">• {fisherman.district}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono">{formatPhoneNumber(fisherman.phoneNumber)}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-800">{fisherman.port}</span>
          </div>
        </div>

        {/* Blocked reason banner if blocked */}
        {fisherman.isBlocked && fisherman.blockReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-xs text-rose-700">
            <p className="font-semibold">Block Reason:</p>
            <p className="mt-0.5">{fisherman.blockReason}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(fisherman)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View Profile
        </Button>

        {fisherman.isBlocked ? (
          onUnblock && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnblock(fisherman)}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Unblock
            </Button>
          )
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onBlock(fisherman)}
            leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
          >
            Block Fisherman
          </Button>
        )}
      </div>
    </div>
  );
};
