const {
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
} = require('jsx-email')
const { createElement } = require('react')

function OrderConfirmationEmail(props) {
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

  return createElement(Html, { lang: 'en' }, [
    createElement(Head, null, 
      createElement('title', null, `Order Confirmation - ${orderNumber}`)
    ),
    createElement(Body, { style: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' } }, 
      createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' } }, [
        // Header with Logo
        createElement(Section, { style: { backgroundColor: '#000000', padding: '20px', textAlign: 'center' } }, [
          createElement(Img, {
            src: `${baseUrl}/images/logo-rect-white.jpg`,
            alt: 'Sports Devil',
            width: '200',
            height: 'auto',
            style: { margin: '0 auto' }
          }),
          createElement(Heading, {
            as: 'h1',
            style: { 
              color: '#ffffff', 
              fontSize: '24px', 
              fontWeight: 'bold',
              margin: '10px 0 0 0'
            }
          }, 'Order Confirmation')
        ]),

        // Content
        createElement(Section, { style: { padding: '30px' } }, [
          createElement(Text, { style: { fontSize: '16px', lineHeight: '1.6', color: '#333333' } }, 
            `Dear ${customerName},`
          ),
          
          createElement(Text, { style: { fontSize: '16px', lineHeight: '1.6', color: '#333333' } }, 
            "Thank you for your order! We're excited to get your sports equipment ready for dispatch."
          ),

          // Order Details
          createElement(Section, { style: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #eee' } }, [
            createElement(Heading, {
              as: 'h2',
              style: { 
                fontSize: '20px', 
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                color: '#333333'
              }
            }, `Order Details - ${orderNumber}`),

            // Order Items
            ...items.map((item, index) =>
              createElement(Row, { 
                key: index, 
                style: { borderBottom: '1px solid #eee', padding: '15px 0' } 
              }, 
                createElement(Column, { style: { width: '100%' } }, 
                  createElement(Row, null, [
                    createElement(Column, { style: { width: '70%' } }, [
                      createElement(Text, { style: { fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#333333' } }, 
                        item.name
                      ),
                      createElement(Text, { style: { fontSize: '14px', color: '#666666', margin: '5px 0' } }, 
                        `Quantity: ${item.quantity}`
                      )
                    ]),
                    createElement(Column, { style: { width: '30%', textAlign: 'right' } }, 
                      createElement(Text, { style: { fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#333333' } }, 
                        `£${(item.price * item.quantity).toFixed(2)}`
                      )
                    )
                  ])
                )
              )
            ),

            // Order Totals
            createElement(Section, { style: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '20px 0' } }, [
              createElement(Row, { style: { marginBottom: '5px' } }, [
                createElement(Column, { style: { width: '70%' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, 'Subtotal:')
                ),
                createElement(Column, { style: { width: '30%', textAlign: 'right' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, `£${totals.subtotal.toFixed(2)}`)
                )
              ]),
              createElement(Row, { style: { marginBottom: '5px' } }, [
                createElement(Column, { style: { width: '70%' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, 'Shipping:')
                ),
                createElement(Column, { style: { width: '30%', textAlign: 'right' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, `£${totals.shipping.toFixed(2)}`)
                )
              ]),
              createElement(Row, { style: { marginBottom: '5px' } }, [
                createElement(Column, { style: { width: '70%' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, 'VAT (20%):')
                ),
                createElement(Column, { style: { width: '30%', textAlign: 'right' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '14px', color: '#666666' } }, `£${totals.vat.toFixed(2)}`)
                )
              ]),
              createElement(Hr, { style: { margin: '10px 0' } }),
              createElement(Row, null, [
                createElement(Column, { style: { width: '70%' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333333' } }, 'Total:')
                ),
                createElement(Column, { style: { width: '30%', textAlign: 'right' } }, 
                  createElement(Text, { style: { margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333333' } }, `£${totals.total.toFixed(2)}`)
                )
              ])
            ])
          ]),

          // Delivery Information
          createElement(Section, { style: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #eee' } }, [
            createElement(Heading, {
              as: 'h3',
              style: { 
                fontSize: '18px', 
                fontWeight: 'bold',
                margin: '0 0 15px 0',
                color: '#333333'
              }
            }, '📦 Delivery Information'),
            
            createElement(Text, { style: { fontSize: '16px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' } }, 
              'Shipping to:'
            ),
            createElement(Text, { style: { fontSize: '14px', color: '#666666', lineHeight: '1.4', margin: '0' } }, 
              `${shippingAddress.name}\n${shippingAddress.address}\n${shippingAddress.city}, ${shippingAddress.postalCode}\n${shippingAddress.country}`
            ),
            
            createElement(Text, { style: { fontSize: '14px', color: '#666666', margin: '15px 0 0 0' } }, [
              createElement('strong', null, 'Estimated Delivery: '),
              estimatedDelivery
            ]),
            
            createElement(Text, { style: { fontSize: '14px', color: '#666666', margin: '10px 0' } }, 
              "We'll send you tracking information as soon as your order ships. You can also track your order anytime in your account dashboard."
            )
          ]),

          // Track Order Button
          createElement(Section, { style: { textAlign: 'center', margin: '30px 0' } }, 
            createElement(Button, {
              href: trackingUrl,
              style: {
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }, 'Track Your Order')
          )
        ]),

        // Footer
        createElement(Section, { style: { backgroundColor: '#f8f9fa', padding: '30px', textAlign: 'center' } }, [
          createElement(Text, { style: { fontSize: '16px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' } }, 
            'Sports Devil'
          ),
          createElement(Text, { style: { fontSize: '14px', color: '#666666', margin: '0 0 15px 0' } }, 
            '309 Kingstanding Rd, Birmingham B44 9TH\n📞 07897813165 | 📧 info@sportsdevil.co.uk'
          ),
          
          createElement(Text, { style: { fontSize: '14px', fontWeight: 'bold', color: '#333333', margin: '0 0 10px 0' } }, 
            '📧 Order Changes or Enquiries:'
          ),
          createElement(Text, { style: { fontSize: '14px', margin: '0 0 20px 0' } }, [
            'Please contact ',
            createElement(Link, {
              href: 'mailto:info@sportsdevil.co.uk',
              style: { color: '#000000', textDecoration: 'none' }
            }, 'info@sportsdevil.co.uk')
          ]),
          
          // Social Links
          createElement(Section, { style: { margin: '20px 0' } }, [
            createElement(Text, { style: { fontSize: '14px', color: '#666666', margin: '0 0 10px 0' } }, 
              'Follow us:'
            ),
            createElement(Row, null, [
              createElement(Column, { style: { width: '33.33%', textAlign: 'center' } }, 
                createElement(Link, {
                  href: 'https://www.facebook.com/sportsdevil.co.uk/',
                  style: { color: '#666666', textDecoration: 'none', fontSize: '14px' }
                }, 'Facebook')
              ),
              createElement(Column, { style: { width: '33.33%', textAlign: 'center' } }, 
                createElement(Link, {
                  href: 'https://www.instagram.com/sportsdevil1/',
                  style: { color: '#666666', textDecoration: 'none', fontSize: '14px' }
                }, 'Instagram')
              ),
              createElement(Column, { style: { width: '33.33%', textAlign: 'center' } }, 
                createElement(Link, {
                  href: 'https://www.tiktok.com/@sportsdevil3/video/7527043096287186198',
                  style: { color: '#666666', textDecoration: 'none', fontSize: '14px' }
                }, 'TikTok')
              )
            ])
          ]),
          
          createElement(Text, { style: { fontSize: '12px', color: '#666666', margin: '15px 0 0 0' } }, 
            'Thank you for choosing Sports Devil!'
          )
        ])
      ])
    )
  ])
}

module.exports = { OrderConfirmationEmail }