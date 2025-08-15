import { OrderTracking } from '../../components/order-tracking'

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">
            Enter your order number to get real-time updates on your cricket equipment delivery
          </p>
        </div>
        
        <OrderTracking showSearch={true} />
      </div>
    </div>
  )
}