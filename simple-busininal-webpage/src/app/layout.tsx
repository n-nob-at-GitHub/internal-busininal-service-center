import Provider from './Provider'
import Header from '@/components/Header'
import Contents from '@/components/Contents'
import Footer from '@/components/Footer'

export default function RootLayout()
{
  return (
    <html lang='ja'>
      <body>
        <Header />
        <Provider>
          <Contents />
        </Provider>
        <Footer />
      </body>
    </html>
  )
}
