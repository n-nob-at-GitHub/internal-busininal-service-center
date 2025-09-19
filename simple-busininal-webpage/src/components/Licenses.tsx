'use client'
import { 
  useEffect, 
  useState 
} from 'react'
import axios from 'axios'
import {
  Button,
  Card,
  CardContent,
  Link,
  Typography,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

const fetchLicenses: any = async () => {
  const res = await axios.get('/api/licenses')
  return res.data
}

const sendMail: any = async (params: any) => {
  const res = await axios.post('/api/mail', params)
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

  // Investigate to sending email using 'nodemailer' on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => sendMail({ subject: 'Test Mail', text: 'フロントエンドから, API呼び出しでメール送信する方法を確認' }) } variant='outlined'>メール送信テスト</Button>
  // Investigate to get png image encoded in base64 format on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => getNoImageFile('./src/images/icons8-no-image-96.png', 'base64') } variant='outlined'>ファイル受信テスト</Button>
  // Investigate to get religious information on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchReligions() } variant='outlined'>宗教名取得テスト</Button>
  // Investigate to get condolence type on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchCondolenceTypes() } variant='outlined'>弔問種別取得テスト</Button>
  // Investigate to get condolence types by decedentId on API call at front end.0
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchCondolenceTypesByDecedentId(71) } variant='outlined'>弔問種別取得（故人指定）テスト</Button>
  // Investigate to create default condolence types on API call at front end.0
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => createDefaultCondolenceTypes() } variant='outlined'>弔問種別（デフォルト）登録テスト</Button>
  // Investigate to create condolence type on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => createCondolenceType() } variant='outlined'>弔問種別登録テスト</Button>
  // Investigate to get condolence type on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchCondolenceType() } variant='outlined'>弔問種別取得テスト</Button>
  // Investigate to delete condolence type on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => deleteCondolenceType(100) } variant='outlined'>弔問種別削除テスト</Button>
  // Investigate to get summary by condolence types on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchCondolenceTypeSummary() } variant='outlined'>弔問種別ごとの集計テスト</Button>
  // Investigate to get mourners by condolence types on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchCondolenceTypeMourners() } variant='outlined'>弔問種別ごとの弔問者集計テスト</Button>
  // Investigate to get summary by decedent on API call at front end.
  // <Button sx={{ margin: '0.5rem' }} onClick={ () => fetchDecedentSummary(74) } variant='outlined'>指定故人の集計テスト</Button>
  return (
    createLicenseInformation()
  )
}

export default Licenses