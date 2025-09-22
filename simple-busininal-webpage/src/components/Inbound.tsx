'use client'
import axios from 'axios'
import {
  useEffect,
  useState,
} from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import DataSaverOnOutlinedIcon from '@mui/icons-material/DataSaverOnOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

interface Material {
  id: number
  name: string
  unit: string
  price: number
  fileName?: string
  stockId: number
}

interface InboundItem {
  materialId: number
  stockId: number
  name: string
  unit: string
  price: number
  quantity: number
}

const Inbound = () => {
  const [ materials, setMaterials ] = useState<Material[]>([])
  const [ quantities, setQuantities ] = useState<Record<number, number>>({})
  const [ open, setOpen ] = useState(false)
  const [ selectedItems, setSelectedItems ] = useState<InboundItem[]>([])
  const [ alertOpen, setAlertOpen ] = useState(false)

  useEffect(() => {
    (async function () {
      const resMs = await fetchMaterials()
      setMaterials(resMs)
    })()
  }, [])

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: value }))
  }

  const handleConfirm = () => {
    const items = materials
      .filter((m) => quantities[m.id] && quantities[m.id] > 0)
      .map((m) => ({
        materialId: m.id,
        stockId: m.stockId,
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
        stockId: item.stockId, // If not present, undefined.
        materialId: item.materialId,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        updatedBy: 'system',
      }))
      const updatedStocks = await updateStocks(stockPayload)
      const inboundPayload = selectedItems.map(item => {
        const stockInfo = updatedStocks.find((s : any) => s.materialId === item.materialId)
        return {
          stockId: stockInfo?.id, // Here, stockId must exist.
          quantity: item.quantity,
          amount: item.quantity * item.price,
          unitPrice: item.price,
          unit: item.unit,
          createdBy: 'system',
        }
      })
      createInbounds(inboundPayload),
      setOpen(false)
      setQuantities({})
    } catch (error) {
      console.error('入庫処理エラー:', error)
    }
  }

  const fetchMaterials: any = async () => {
    const res = await axios.get('/api/materials')
    return res.data
  }

  const createInbounds: any = async (inboundPayload : any) => {
    const res = await axios.post('/api/inbounds', inboundPayload)
    return res.data
  }

  const updateStocks: any = async (stockPayload : any) => {
    const res = await axios.put('/api/stocks', stockPayload)
    return res.data
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant='h4' component='h2'>
            入庫対象品
          </Typography>
        </Box>
        <IconButton color='primary' onClick={ handleConfirm }>
          <DataSaverOnOutlinedIcon />
        </IconButton>
      </div>
      <Grid container spacing={ 1 }>
        { materials.map((m) => (
          <Grid key={ m.id } size={{ xs: 12, sm: 6, md: 2.4 }} sx={{ display: 'flex' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 5 }}>
              <CardContent>
                <img
                  src={ m.fileName ? `/images/${m.fileName}` : '/images/icons8-no-image-250.png' }
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
                  label={ `入庫数 (${ m.unit })` }
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

      <Dialog open={ open } onClose={ () => setOpen(false) } maxWidth='sm' fullWidth>
        <DialogTitle sx={{ backgroundColor: '#eff' }}>入庫確認</DialogTitle>
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
        <DialogActions sx={{ backgroundColor: '#eff' }}>
          <Button variant='outlined' onClick={() => setOpen(false)}>キャンセル</Button>
          <Button variant='contained' color='primary' onClick={ handleOk }>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={ alertOpen } 
        onClose={ () => setAlertOpen(false) } 
        maxWidth='sm' 
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#FFF3E0',
            },
          },
        }}>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={ 1 }>
            <WarningAmberIcon color='warning' />
            <Typography variant='h6' color='warning.main'>
              警告
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

export default Inbound
