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

type License = {
  name: string
  repository?: string
  licenseText: string
}

const fetchLicenses: any = async () => {
  const res = await axios.get('/licenses.json')
  return res.data
}

const Licenses = () => {
  const [ licenses, setLicenses ] = useState<Record<string, License>>({})
  const createLicenseInformation = () => {
    return Object.keys(licenses).map(k => {
      return <Card key={ k } variant='outlined' sx={{ m: 2 }}>
        <CardContent>
          <Typography>
            <Link sx={{ textDecoration: licenses[k].repository ? 'underline' : 'none' }} 
              color={ licenses[k].repository ? 'primary' : 'textSecondary' }
              href={ licenses[k].repository }
              target='_blank'>
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
      setLicenses(res)
    })()
  }, [])

  return createLicenseInformation()
}

export default Licenses