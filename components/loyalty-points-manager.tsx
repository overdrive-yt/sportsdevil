'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { useLoyaltyBalance, useLoyaltyTransactions, useLoyaltyRedemption } from '../hooks/use-loyalty-points'
import { formatPriceSimple } from '../lib/utils'
import { 
  Star, 
  Gift, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Loader2,
  Plus,
  Minus,
  Info
} from 'lucide-react'

export function LoyaltyPointsManager() {
  const { data: loyaltyBalance, isLoading: balanceLoading } = useLoyaltyBalance()
  const { data: transactionsData, isLoading: transactionsLoading } = useLoyaltyTransactions(10, 0)
  const {
    selectedPoints,
    setSelectedPoints,
    showRedemptionDialog,
    setShowRedemptionDialog,
    redeemableOptions,
    handleRedeem,
    isRedeeming
  } = useLoyaltyRedemption()

  if (balanceLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading loyalty points...</span>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (type: string) => {
    return type === 'EARNED' ? (
      <Plus className="h-4 w-4 text-green-600" />
    ) : (
      <Minus className="h-4 w-4 text-red-600" />
    )
  }

  const getStatusColor = (type: string) => {
    return type === 'EARNED' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Loyalty Points Overview */}
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-25">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Loyalty Points Balance</span>
          </CardTitle>
          <CardDescription>
            Earn 100 points for every £1 spent • 500 points = £5 voucher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {loyaltyBalance?.loyaltyPoints || 0}
              </p>
              <p className="text-sm text-muted-foreground">Available Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {formatPriceSimple(loyaltyBalance?.redeemableAmount || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Redeemable Value</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {formatPriceSimple(loyaltyBalance?.totalSpent || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>

          {loyaltyBalance?.canRedeem && (
            <div className="flex justify-center">
              <Dialog open={showRedemptionDialog} onOpenChange={setShowRedemptionDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem Points for Voucher
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Redeem Loyalty Points</DialogTitle>
                    <DialogDescription>
                      Convert your points into shopping vouchers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        500 points = £5 voucher • Vouchers are valid for 90 days
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <label className="text-sm font-medium">Select Points to Redeem</label>
                      <Select 
                        value={selectedPoints.toString()} 
                        onValueChange={(value) => setSelectedPoints(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select points amount" />
                        </SelectTrigger>
                        <SelectContent>
                          {redeemableOptions
                            .filter(option => option <= (loyaltyBalance?.loyaltyPoints || 0))
                            .map(option => (
                            <SelectItem key={option} value={option.toString()}>
                              {option} points = £{(option / 500) * 5} voucher
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Points to redeem:</span>
                        <span className="font-medium">{selectedPoints}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Voucher value:</span>
                        <span className="font-medium text-green-600">
                          £{(selectedPoints / 500) * 5}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Remaining points:</span>
                        <span className="font-medium">
                          {(loyaltyBalance?.loyaltyPoints || 0) - selectedPoints}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowRedemptionDialog(false)}
                        disabled={isRedeeming}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleRedeem}
                        disabled={isRedeeming || selectedPoints > (loyaltyBalance?.loyaltyPoints || 0)}
                      >
                        {isRedeeming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Redeeming...
                          </>
                        ) : (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Redeem Points
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!loyaltyBalance?.canRedeem && loyaltyBalance && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                You need {loyaltyBalance.nextRewardAt} more points to unlock your first voucher
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, ((loyaltyBalance.loyaltyPoints % 500) / 500) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Points Activity</span>
          </CardTitle>
          <CardDescription>Your latest points earnings and redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : transactionsData?.transactions?.length > 0 ? (
            <div className="space-y-4">
              {transactionsData.transactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(transaction.type)}>
                      {transaction.type === 'EARNED' ? '+' : ''}{transaction.points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Points Activity Yet</h3>
              <p className="text-muted-foreground">
                Start shopping to earn loyalty points
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}