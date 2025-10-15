'use client'
import axios from 'axios'
import {
  useEffect,
  useState,
} from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import {
  useQueryClient,
} from '@tanstack/react-query'
import DataSaverOnOutlinedIcon from '@mui/icons-material/DataSaverOnOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { getAccessToken } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

interface Material {
  id: number
  name: string
  unit: string
  price: number
  fileName?: string
  isValid: boolean
  stockId: number
}

interface OutboundItem {
  materialId: number
  stockId: number
  deliverySiteId: number
  name: string
  unit: string
  price: number
  quantity: number
}

const materialsBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://tqfywt582f.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const outboundsBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://gsxoixvds9.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const outboundStocksBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://khp821vqq4.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const deliverySiteBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://rvqu4egfwd.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const Outbound = () => {
  const userInfo = useUser()
  const [ deliverySites, setDeliverySites ] = useState<{ id: number, name: string }[]>([])
  const [ selectedDeliverySite, setSelectedDeliverySite ] = useState<number | null>(null)
  const [ materials, setMaterials ] = useState<Material[]>([])
  const [ quantities, setQuantities ] = useState<Record<number, number>>({})
  const [ open, setOpen ] = useState(false)
  const [ selectedItems, setSelectedItems ] = useState<OutboundItem[]>([])
  const [ alertOpen, setAlertOpen ] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    (async function () {
      const resMs = await fetchMaterials()
      setMaterials(resMs)

      const resDs = await fetchDeliverySites()
      setDeliverySites(resDs)
      if (resDs.length > 0) setSelectedDeliverySite(resDs[0].id)
    })()
  }, [])

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: value }))
  }

  const handleConfirm = () => {
    if (!selectedDeliverySite) {
      setAlertOpen(true)
      return
    }
    const items = materials
      .filter((m) => quantities[m.id] && quantities[m.id] > 0)
      .map((m) => ({
        materialId: m.id,
        stockId: m.stockId,
        deliverySiteId: selectedDeliverySite,
        name: m.name,
        unit: m.unit,
        price: m.price,
        quantity: quantities[m.id],
      }))
    if (items.length === 0) {
      setAlertOpen(true)
      return
    }
    setSelectedItems(items)
    setOpen(true)
  }

  const handleOk = async () => {
    if (selectedItems.length === 0) return
    try {
      const stockPayload = selectedItems.map(item => ({
        materialId: item.materialId,
        stockId: item.stockId, // If not present, undefined.
        deliverySiteId: selectedDeliverySite,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        updatedBy: 'system',
      }))
      const updatedStocks = await updateStocks(stockPayload)
      const outboundPayload = selectedItems.map(item => {
        const stockInfo = updatedStocks.find((s : any) => s.materialId === item.materialId)
        return {
          stockId: stockInfo?.id, // Here, stockId must exist.
          deliverySiteId: selectedDeliverySite,
          quantity: item.quantity,
          amount: item.quantity * item.price,
          unitPrice: item.price,
          unit: item.unit,
          createdBy: 'system',
          updatedBy: 'system',
        }
      })
      await createOutbounds(outboundPayload),
      await queryClient.invalidateQueries({ queryKey: [ 'stocks' ] })
      setOpen(false)
      setQuantities({})
    } catch (error) {
      console.error('出庫処理エラー:', error)
    }
  }

  const fetchDeliverySites: any = async () => {
    const accessToken = getAccessToken()
    const res = await axios.get(`${ deliverySiteBaseURL }/delivery-site`,
      {
        headers: {
          Authorization: accessToken ? `Bearer ${ accessToken }` : '',
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  }

  const fetchMaterials: any = async () => {
    const accessToken = getAccessToken()
    const res = await axios.get(`${ materialsBaseURL }/materials`,
      {
        headers: {
          Authorization: accessToken ? `Bearer ${ accessToken }` : '',
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  }

  const createOutbounds: any = async (outboundPayload : any) => {
    const accessToken = getAccessToken()
    const payload = outboundPayload.map((item: any) => ({
      ...item,
      updatedBy: userInfo?.name ?? 'system',
      updatedAt: new Date().toISOString(),
    }))
    const res = await axios.post(`${ outboundsBaseURL }/outbounds`, payload, 
      {
        headers: {
          Authorization: accessToken ? `Bearer ${ accessToken }` : '',
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  }

  const updateStocks: any = async (stockPayload : any) => {
    const accessToken = getAccessToken()
    const payload = stockPayload.map((item: any) => ({
      ...item,
      updatedBy: userInfo?.name ?? 'system',
      updatedAt: new Date().toISOString(),
    }))
    const res = await axios.put(`${ outboundStocksBaseURL }/outbound-stocks`, stockPayload, 
      {
        headers: {
          Authorization: accessToken ? `Bearer ${ accessToken }` : '',
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem' }}>
        <Box display='flex' alignItems='center' gap={ 2 } sx={{ mb: 1 }}>
          <Typography variant='h4' component='h2'>
            出庫対象品
          </Typography>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel id='delivery-site-label'>配送先</InputLabel>
            <Select
              labelId='delivery-site-label'
              value={ selectedDeliverySite ?? '' }
              label='配送先'
              onChange={ (e) => setSelectedDeliverySite(Number(e.target.value)) }
            >
            { deliverySites.map(site => (
              <MenuItem key={ site.id } value={ site.id }>{ site.name }</MenuItem>
            )) }
            </Select>
          </FormControl>
        </Box>
        <IconButton color='primary' onClick={ handleConfirm }>
          <DataSaverOnOutlinedIcon />
        </IconButton>
      </div>
      <Grid container spacing={ 1 }>
        { materials.filter((m) => m.isValid).map((m) => (
          <Grid key={ m.id } size={{ xs: 12, sm: 6, md: 2.4 }} sx={{ display: 'flex' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 5 }}>
              <CardContent>
                <img
                  src={ m.fileName ? `/images/${ m.fileName }` : '/images/icons8-no-image-250.png' }
                  alt={ m.name }
                  style={{ 
                    width: '250px', 
                    height: '250px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Typography variant='body2'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    { m.name }
                </Typography>
                <TextField
                  type='number'
                  label={ `出庫数 (${ m.unit })` }
                  value={ quantities[m.id] || '' }
                  onChange={ (e) => handleQuantityChange(m.id, Number(e.target.value)) }
                  fullWidth
                  margin='normal'
                  size='small'
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={ open } 
        onClose={ () => setOpen(false) } 
        maxWidth='sm' 
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#E3F2FD',
            },
          },
        }}>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={ 1 }>
            <InfoOutlinedIcon color='primary' />
            <Typography variant='h6' color='primary.main'>
              出庫確認
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
            sx={{
            maxHeight: 400,
            overflowY: 'auto',
          }}>
          <List disablePadding sx={{ border: '1px solid #ccc', borderRadius: 1, }}>
            { selectedItems.map((item, index) => (
              <ListItem
                key={ item.materialId } 
                sx={{
                    py: 0.5,
                    borderBottom: index !== selectedItems.length - 1 ? '1px solid #ccc' : 'none',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                  }}
                >
                <ListItemText
                  primary={ `${item.name}` }
                  secondary={ `数量: ${item.quantity} ${item.unit}` }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={ () => setOpen(false) }>キャンセル</Button>
          <Button variant='contained' color='primary' onClick={ handleOk }>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={ alertOpen } 
        onClose={ () => setAlertOpen(false) } 
        maxWidth='sm' 
        >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={ 1 }>
            <WarningAmberIcon color='warning' />
            <Typography variant='h6' color='warning.main'>
              注意
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>在庫品を選択してください。</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='warning' onClick={ () => setAlertOpen(false) } autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Outbound
