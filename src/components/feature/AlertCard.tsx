import { useState } from 'react';
import { Alert } from '../../types';
import { Button } from '../base/Button';
import { format } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
  onClaim: (scheduleId: string) => Promise<boolean>;
  currentUserId: string;
  showClaimButton?: boolean;
}

export function AlertCard({ alert, onClaim, currentUserId, showClaimButton = true }: AlertCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(alert.claim_status === 'claimed');

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const success = await onClaim(alert.schedule_id);
      if (success) {
        setIsClaimed(true);
      }
    } catch (error) {
      console.error('Failed to claim alert:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const isOwnClaim = alert.claimed_by === currentUserId;
  const canClaim = !isClaimed && showClaimButton;

  return (
    <div className={`bg-gradient-to-r ${
      isClaimed 
        ? isOwnClaim 
          ? 'from-green-50 to-blue-50 border-l-4 border-[#006E5B]' 
          : 'from-gray-50 to-gray-100 border-l-4 border-gray-400'
        : 'from-yellow-50 to-orange-50 border-l-4 border-[#00FFAA]'
    } rounded-lg p-4 shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{alert.customer_name}</h3>
            <span className="text-sm text-gray-600">
              {format(new Date(alert.scheduled_time), 'HH:mm')}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {alert.vehicle}
            </span>
            <span className="text-xs text-gray-600">Lead ID: {alert.lead_id}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1">AI Prep Notes:</p>
        <p className="text-xs text-gray-600">{alert.ai_prep_notes}</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isClaimed ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOwnClaim 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <i className={`${isOwnClaim ? 'ri-check-line' : 'ri-user-line'} mr-1`}></i>
              {isOwnClaim ? 'Claimed by You' : `Claimed by ${alert.claimed_by}`}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <i className="ri-time-line mr-1"></i>
              Unclaimed
            </span>
          )}
          
          {alert.claimed_at && (
            <span className="text-xs text-gray-500">
              at {format(new Date(alert.claimed_at), 'HH:mm')}
            </span>
          )}
        </div>

        {canClaim && (
          <Button
            onClick={handleClaim}
            disabled={isClaiming}
            size="sm"
            className="whitespace-nowrap"
          >
            {isClaiming ? (
              <>
                <i className="ri-loader-4-line mr-1 animate-spin"></i>
                Claiming...
              </>
            ) : (
              <>
                <i className="ri-hand-heart-line mr-1"></i>
                Claim
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}