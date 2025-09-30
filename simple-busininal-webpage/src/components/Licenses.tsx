'use client'
import { 
  useEffect, 
  useState 
} from 'react'
import axios from 'axios'
import {
  Card,
  CardContent,
  Link,
  Typography,
} from '@mui/material'

const fetchLicenses: any = async () => {
  const url = process.env.NODE_ENV === 'production'
    ? `https://your-api-gateway-url/licenses/`
    : `/api/licenses`
  const res = await axios.get(url)
  return res.data
}

const sendMail: any = async (params: any) => {
  const url = process.env.NODE_ENV === 'production'
    ? `https://your-api-gateway-url/mail/`
    : `/api/mail`
  const res = await axios.post(url, params)
  return res.data
}

const Licenses = () => {
  const [ licenses, setLicenses ] = useState<any>()
  const createLicenseInformation = () => {
    const keys = Object.keys(licenses ?? {})
    return keys.map(k => {
      return <Card key={ k } variant='outlined' sx={{ m: 2 }}>
        <CardContent>
          <Typography>
            <Link sx={{ textDecoration: licenses[k].repository ? 'underline' : 'none' }} color={ licenses[k].repository ? 'primary' : 'textSecondary' } href={ licenses[k].repository } target='_blank'>
              { licenses[k].name }
            </Link>
          </Typography>
          <Typography>
            { licenses[k].licenseText }
          </Typography>
        </CardContent>
      </Card>
    })
  }

  useEffect(() => {
    (async function () {
      const res = await fetchLicenses()
      const resJson = JSON.parse(res)
      setLicenses(resJson)
    })()
  }, [])

  return (
    createLicenseInformation()
  )
}

export default Licenses