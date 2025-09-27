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
import { type Stock } from '@/types/dbFunctions'

const Stocks = () => {
  const [ materials, setMaterials ] = useState<any>([])
  useEffect(() => {
    (async function () {
      const res = await fetchMaterials()
      setMaterials(res.map((v: any, k: number) => { return { id: v.id, name: v.name } }))
    })()
  }, [])

  const columns = useMemo<MRT_ColumnDef<Stock>[]>(
    () => [
        {
          accessorKey: 'id',
          header: 'No',
          enableEditing: false,
          maxSize: 30,
          Cell: ({ row }) => (
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
          header: '資材',
          id: 'material',
          maxSize: 100,
          accessorFn: (row) => materials.find((m: any) => m.id === Number(row.materialId))?.name ?? '',
          Cell: ({ row }) => {
            const material = materials.find((m: any) => m.id === Number(row.original.materialId))
            return material ? material.name : ''
          },
        },
        {
          accessorKey: 'totalQuantity',
          header: '合計数量',
          maxSize: 30,
        },
        {
          accessorKey: 'totalAmount',
          header: '合計金額',
          maxSize: 30,
        },
        {
          accessorKey: 'unit',
          header: '単位',
          maxSize: 50,
        },
      ],
    [ materials ],
  )
  
  // call READ hook
  const {
    data: fetchedStocks = [],
    isError: isLoadingStocksError,
    isFetching: isFetchingStocks,
    isLoading: isLoadingStocks,
  } = useGetStocks()

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedStocks,
    positionToolbarDropZone: 'none',
    enableColumnActions: false,
    enableGlobalFilter: true,
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
    muiToolbarAlertBannerProps: isLoadingStocksError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>在庫一覧</Typography>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={ table } />
      </Box>
    ),
    state: {
      isLoading: isLoadingStocks,
      showAlertBanner: isLoadingStocksError,
      showProgressBars: isFetchingStocks,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get stocks from api)
function useGetStocks() {
  return useQuery<Stock[]>({
    queryKey: [ 'stocks' ],
    queryFn: async () => {
      const url = process.env.NODE_ENV === 'production'
        ? `https://your-api-gateway-url/stock/`
        : `/api/stock`
      const response = await axios.get(url)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

const fetchMaterials: any = async () => {
  const url = process.env.NODE_ENV === 'production'
    ? `https://your-api-gateway-url/material/`
    : `/api/material`
  const res = await axios.get(url)
  return res.data
}

export default Stocks