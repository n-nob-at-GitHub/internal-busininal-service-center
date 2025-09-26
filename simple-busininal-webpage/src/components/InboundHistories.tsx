'use client'
import axios from 'axios'
import {
  useEffect,
  useMemo, 
  useState,
} from 'react'
import {
  MaterialReactTable, 
  MRT_ToggleGlobalFilterButton,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table'
import {
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import DownloadingIcon from '@mui/icons-material/Downloading'
import { useQuery } from '@tanstack/react-query'
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { type Inbound } from '@/types/dbFunctions'

interface Material {
  id: number
  name: string
}

interface Stock {
  id: number
  materialId: number
  materialName?: string
}

const InboundHistories = () => {
  const [ materials, setMaterials ] = useState<Material[]>([])
  const [ stocks, setStocks ] = useState<Stock[]>([])
  const [ startDate, setStartDate ] = useState<Dayjs | null>(null)
  const [ endDate, setEndDate ] = useState<Dayjs | null>(null)
  useEffect(() => {
    (async function () {
      const resMs = await fetchMaterials()
      const ms: Material[] = resMs.map((v: any) => ({ id: v.id, name: v.name }))
      setMaterials(ms)
      const resSs = await fetchStocks()
      const ss: Stock[] = resSs.map((v: any) => {
        const material = ms.find((m) => m.id === v.materialId)
        return {
          id: v.id,
          materialId: v.materialId,
          materialName: material?.name ?? '',
        }
      })
      setStocks(ss)
    })()
  }, [])

  const columns = useMemo<MRT_ColumnDef<Inbound>[]>(
    () => [
        {
          accessorKey: 'id',
          header: 'No',
          enableEditing: false,
          maxSize: 30,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                gap: '0.5rem',
              }}
              >
              { row.index + 1 }
            </Box>
          ),
        },
        {
          header: '在庫商品名',
          id: 'materialName',
          maxSize: 30,
          accessorFn: (row) => stocks.find((s) => s.id === Number(row.stockId))?.materialName ?? '',
          Cell: ({ row }) => {
            const stock = stocks.find((s) => s.id === Number(row.original.stockId))
            return stock ? stock.materialName : ''
          },
        },
        {
          accessorKey: 'quantity',
          header: '数量',
          maxSize: 30,
        },
        {
          accessorKey: 'amount',
          header: '金額',
          maxSize: 30,
        },
        {
          accessorKey: 'unit',
          header: '単位',
          maxSize: 30,
        },
        {
          accessorKey: 'createdBy',
          header: '入庫者',
          maxSize: 30,
        },
        {
          accessorKey: 'createdAt',
          header: '入庫時刻',
          Cell: ({ renderedCellValue }) => {
            if (!renderedCellValue) return ''
            const date = new Date(renderedCellValue as string)
            return date.toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).replace(/\//g, '/')
          }
        },
      ],
    [ stocks ],
  )
  
  // call READ hook
  const {
    data: fetchedInboundHistories = [],
    isError: isLoadingInboundHistoriesError,
    isFetching: isFetchingInboundHistories,
    isLoading: isLoadingInboundHistories,
  } = useGetInboundHistories()

  const filteredData = useMemo(() => {
    return fetchedInboundHistories.filter((item) => {
      if (!item.createdAt) return false
      const createdAt = dayjs(item.createdAt)
      if (startDate && createdAt.isBefore(startDate, 'day')) return false
      if (endDate && createdAt.isAfter(endDate, 'day')) return false
      return true
    })
  }, [ fetchedInboundHistories, startDate, endDate ])

  const downloadCSV = (rows: Inbound[]) => {
    if (!rows.length) return
    const headers = [ 'ID', '在庫商品名', '数量', '金額', '単位', '入庫者', '入庫時刻' ]
    const csvRows = [
      headers.join(','),
      ...rows.map((row) => [
        row.id,
        stocks.find((s) => s.id === row.stockId)?.materialName ?? '',
        row.quantity,
        row.amount,
        row.unit,
        row.createdBy,
        row.createdAt ? dayjs(row.createdAt).format('YYYY/MM/DD HH:mm:ss') : ''
      ].join(','))
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    const fileName = `inbound_histories_${ dayjs().format('YYYYMMDD') }.csv`
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: filteredData,
    positionToolbarDropZone: 'none',
    enableGlobalFilter: true,
    enableColumnActions: false,
    enableStickyHeader: true,
    // localization: MRT_Localization_JA,
    localization: {
      actions: '',
      cancel: '',
      clearSearch: '',
      noRecordsToDisplay: '表示するレコードがありません',
      noResultsFound: '結果なし',
      rowsPerPage: '表示件数',
      save: '',
      search: '検索',
      showHideSearch: '',
      sortByColumnAsc: '',
      sortByColumnDesc: '',
      sortedByColumnAsc: '',
      sortedByColumnDesc: '',
    },
    positionActionsColumn: 'last',
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      shape: 'circular',
      variant: 'outlined',
      rowsPerPageOptions: [5, 10, 20],
    },
    getRowId: (row) => row.id?.toString(),
    muiToolbarAlertBannerProps: isLoadingInboundHistoriesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Typography variant='h4'>入庫履歴</Typography>
        <DatePicker
          label='開始日'
          format='YYYY/MM/DD'
          value={ startDate }
          onChange={ (newValue) => setStartDate(newValue) }
          slotProps={{ 
            textField: { size: 'small' },
            actionBar: {
              actions: [ 'clear', 'cancel' ],
            },
          }}
        />
        <DatePicker
          label='終了日'
          format='YYYY/MM/DD'
          value={ endDate }
          onChange={ (newValue) => setEndDate(newValue) }
          slotProps={{ 
            textField: { size: 'small' },
            actionBar: {
              actions: [ 'clear', 'cancel' ],
            },
          }}
        />
        <IconButton onClick={ () => downloadCSV(filteredData) }>
          <DownloadingIcon />
        </IconButton>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={ table } />
      </Box>
    ),
    state: {
      isLoading: isLoadingInboundHistories,
      showAlertBanner: isLoadingInboundHistoriesError,
      showProgressBars: isFetchingInboundHistories,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return (
    <LocalizationProvider dateAdapter={ AdapterDayjs }>
      <MaterialReactTable table={ table } />
    </LocalizationProvider>
  )
}

// READ hook (get Inbound from api)
function useGetInboundHistories() {
  return useQuery<Inbound[]>({
    queryKey: [ 'inboundHistories' ],
    queryFn: async () => {
      const response = await axios.get('/api/inbound-history')
      return response.data
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}

const fetchMaterials: any = async () => {
  const res = await axios.get('/api/material')
  return res.data
}

const fetchStocks: any = async () => {
  const res = await axios.get('/api/stock')
  return res.data
}

export default InboundHistories