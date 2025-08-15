import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Img,
  Hr,
  Link
} from 'jsx-email'

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderConfirmationProps {
  orderNumber: string
  customerName: string
  items: OrderItem[]
  totals: {
    subtotal: number
    vat: number
    shipping: number
    total: number
  }
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  trackingUrl: string
  baseUrl: string
  estimatedDelivery?: string
}

export default function OrderConfirmationEmail(props: OrderConfirmationProps) {
  const {
    orderNumber,
    customerName,
    items,
    totals,
    shippingAddress,
    trackingUrl,
    baseUrl,
    estimatedDelivery = '2-3 business days'
  } = props

  return (
    <Html lang="en">
      <Head>
        <title>Order Confirmation - {orderNumber}</title>
      </Head>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header with Logo */}
          <Section style={{ backgroundColor: '#000000', padding: '20px', textAlign: 'center' }}>
            <Img
              src={`${baseUrl}/images/logo-rect-white.jpg`}
              alt="Sports Devil"
              width="200"
              height="auto"
              style={{ margin: '0 auto' }}
            />
            <Heading
              as="h1"
              style={{ 
                color: '#ffffff', 
                fontSize: '24px', 
                fontWeight: 'bold',
                margin: '10px 0 0 0'
              }}
            >
              Order Confirmation
            </Heading>
          </Section>

          {/* Content */}
          <Section style={{ padding: '30px' }}>
            <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#333333' }}>
              Dear {customerName},
            </Text>
            
            <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#333333' }}>
              Thank you for your order! We're excited to get your sports equipment ready for dispatch.
            </Text>

            {/* Order Details */}
            <Section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #eee' }}>
              <Heading 
                as="h2" 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  margin: '0 0 20px 0',
                  color: '#333333'
                }}
              >
                Order Details - {orderNumber}
              </Heading>

              {/* Order Items */}
              {items.map((item, index) => (
                <Row key={index} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                  <Column style={{ width: '100%' }}>
                    <Row>
                      <Column style={{ width: '70%' }}>
                        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#333333' }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: '14px', color: '#666666', margin: '5px 0' }}>
                          Quantity: {item.quantity}
                        </Text>
                      </Column>
                      <Column style={{ width: '30%', textAlign: 'right' }}>
                        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#333333' }}>
                          £{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </Column>
                    </Row>
                  </Column>
                </Row>
              ))}

              {/* Order Totals */}
              <Section style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '20px 0' }}>
                <Row style={{ marginBottom: '5px' }}>
                  <Column style={{ width: '70%' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>Subtotal:</Text>
                  </Column>
                  <Column style={{ width: '30%', textAlign: 'right' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>£{totals.subtotal.toFixed(2)}</Text>
                  </Column>
                </Row>
                <Row style={{ marginBottom: '5px' }}>
                  <Column style={{ width: '70%' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>Shipping:</Text>
                  </Column>
                  <Column style={{ width: '30%', textAlign: 'right' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>£{totals.shipping.toFixed(2)}</Text>
                  </Column>
                </Row>
                <Row style={{ marginBottom: '5px' }}>
                  <Column style={{ width: '70%' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>VAT (20%):</Text>
                  </Column>
                  <Column style={{ width: '30%', textAlign: 'right' }}>
                    <Text style={{ margin: '0', fontSize: '14px', color: '#666666' }}>£{totals.vat.toFixed(2)}</Text>
                  </Column>
                </Row>
                <Hr style={{ margin: '10px 0' }} />
                <Row>
                  <Column style={{ width: '70%' }}>
                    <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333333' }}>Total:</Text>
                  </Column>
                  <Column style={{ width: '30%', textAlign: 'right' }}>
                    <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333333' }}>£{totals.total.toFixed(2)}</Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Delivery Information */}
            <Section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #eee' }}>
              <Heading 
                as="h3" 
                style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  margin: '0 0 15px 0',
                  color: '#333333'
                }}
              >
                📦 Delivery Information
              </Heading>
              
              <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' }}>
                Shipping to:
              </Text>
              <Text style={{ fontSize: '14px', color: '#666666', lineHeight: '1.4', margin: '0' }}>
                {shippingAddress.name}<br/>
                {shippingAddress.address}<br/>
                {shippingAddress.city}, {shippingAddress.postalCode}<br/>
                {shippingAddress.country}
              </Text>
              
              <Text style={{ fontSize: '14px', color: '#666666', margin: '15px 0 0 0' }}>
                <strong>Estimated Delivery:</strong> {estimatedDelivery}
              </Text>
              
              <Text style={{ fontSize: '14px', color: '#666666', margin: '10px 0' }}>
                We'll send you tracking information as soon as your order ships. You can also track your order anytime in your account dashboard.
              </Text>
            </Section>

            {/* Track Order Button */}
            <Section style={{ textAlign: 'center', margin: '30px 0' }}>
              <Button
                href={trackingUrl}
                height={48}
                width={200}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  display: 'inline-block',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Track Your Order
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f8f9fa', padding: '30px', textAlign: 'center' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' }}>
              Sports Devil
            </Text>
            <Text style={{ fontSize: '14px', color: '#666666', margin: '0 0 15px 0' }}>
              309 Kingstanding Rd, Birmingham B44 9TH<br/>
              📞 07897813165 | 📧 info@sportsdevil.co.uk
            </Text>
            
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' }}>
              📧 Order Changes or Enquiries:
            </Text>
            <Text style={{ fontSize: '14px', margin: '0 0 20px 0' }}>
              Please contact{' '}
              <Link 
                href="mailto:info@sportsdevil.co.uk" 
                style={{ color: '#000000', textDecoration: 'none' }}
              >
                info@sportsdevil.co.uk
              </Link>
            </Text>
            
            {/* Social Links */}
            <Section style={{ margin: '20px 0' }}>
              <Text style={{ fontSize: '14px', color: '#666666', margin: '0 0 10px 0' }}>
                Follow us:
              </Text>
              <Row>
                <Column style={{ width: '33.33%', textAlign: 'center' }}>
                  <Link 
                    href="https://www.facebook.com/sportsdevil.co.uk/" 
                    style={{ color: '#666666', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Facebook
                  </Link>
                </Column>
                <Column style={{ width: '33.33%', textAlign: 'center' }}>
                  <Link 
                    href="https://www.instagram.com/sportsdevil1/" 
                    style={{ color: '#666666', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Instagram
                  </Link>
                </Column>
                <Column style={{ width: '33.33%', textAlign: 'center' }}>
                  <Link 
                    href="https://www.tiktok.com/@sportsdevil3/video/7527043096287186198" 
                    style={{ color: '#666666', textDecoration: 'none', fontSize: '14px' }}
                  >
                    TikTok
                  </Link>
                </Column>
              </Row>
            </Section>
            
            <Text style={{ fontSize: '12px', color: '#666666', margin: '15px 0 0 0' }}>
              Thank you for choosing Sports Devil!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export { OrderConfirmationEmail }