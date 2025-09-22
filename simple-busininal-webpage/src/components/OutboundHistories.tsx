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
  Typography,
} from '@mui/material'
import {
  useQuery,
} from '@tanstack/react-query'
import { type Outbound } from '@/types/dbFunctions'

interface Material {
  id: number
  name: string
}

interface Stock {
  id: number
  materialId: number
  materialName?: string
}

interface DeliverySite {
  id: number
  name: string
}

const OutboundHistories = () => {
  const [ materials, setMaterials ] = useState<Material[]>([])
  const [ stocks, setStocks ] = useState<Stock[]>([])
  const [ deliverySites, setDeliverySites ] = useState<DeliverySite[]>([])
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
      const resDss = await fetchDeliverySites()
      const dss: DeliverySite[] = resDss.map((v: any) => ({ id: v.id, name: v.name }))
      setDeliverySites(dss)
    })()
  }, [])

  const columns = useMemo<MRT_ColumnDef<Outbound>[]>(
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
          accessorKey: 'stockId',
          header: '在庫商品名',
          maxSize: 30,
          Cell: ({ renderedCellValue }) => stocks.find((s) => s.id === Number(renderedCellValue))?.materialName ?? '',
        },
        {
          accessorKey: 'deliverySiteId',
          header: '配送先名',
          maxSize: 30,
          Cell: ({ renderedCellValue }) => deliverySites.find((s) => s.id === Number(renderedCellValue))?.name ?? '',
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
          header: '出庫者',
          maxSize: 30,
        },
        {
          accessorKey: 'createdAt',
          header: '出庫時刻',
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
    [ materials, stocks, deliverySites ],
  )
  
  // call READ hook
  const {
    data: fetchedOutboundHistories = [],
    isError: isLoadingOutboundHistoriesError,
    isFetching: isFetchingOutboundHistories,
    isLoading: isLoadingOutboundHistories,
  } = useGetOutboundHistories()

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedOutboundHistories,
    positionToolbarDropZone: 'none',
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
    muiToolbarAlertBannerProps: isLoadingOutboundHistoriesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>出庫履歴</Typography>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={ table } />
      </Box>
    ),
    state: {
      isLoading: isLoadingOutboundHistories,
      showAlertBanner: isLoadingOutboundHistoriesError,
      showProgressBars: isFetchingOutboundHistories,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get outbound from api)
function useGetOutboundHistories() {
  return useQuery<Outbound[]>({
    queryKey: [ 'outboundHistories' ],
    queryFn: async () => {
      const response = await axios.get('/api/outbound-history')
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

const fetchDeliverySites: any = async () => {
  const res = await axios.get('/api/delivery-site')
  return res.data
}

const fetchMaterials: any = async () => {
  const res = await axios.get('/api/material')
  return res.data
}

const fetchStocks: any = async () => {
  const res = await axios.get('/api/stock')
  return res.data
}

export default OutboundHistories