'use client'
import axios from 'axios'
import {
  useMemo, 
  useState,
} from 'react'
import {
  MaterialReactTable, 
  MRT_ToggleGlobalFilterButton,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import {
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { type DeliverySite } from '@/types/dbFunctions'
import useConfirmDialog  from '@/hooks/useConfirmDialog'
import { getAccessToken } from '@/lib/utils'

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://rvqu4egfwd.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const DeliverySites = () => {
  const [ validationErrors, setValidationErrors ] = useState<Record<string, string | undefined>>({})

  const columns = useMemo<MRT_ColumnDef<DeliverySite>[]>(
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
          accessorKey: 'name',
          header: '配送先名',
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.name,
            helperText: validationErrors?.name,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                name: undefined,
              }),
          },  
        },
        {
          accessorKey: 'code',
          header: 'コード',
          maxSize: 30,
        },
        {
          accessorKey: 'contact',
          header: '問い合わせ',
        },
      ],
    [ validationErrors ],
  )
  
  // call READ hook
  const {
    data: fetchedDeliverySites = [],
    isError: isLoadingDeliverySitesError,
    isFetching: isFetchingDeliverySites,
    isLoading: isLoadingDeliverySites,
  } = useGetDeliverySites()

  // call CREATE hook
  const { mutateAsync: createDeliverySite, isPending: isCreatingDeliverySite } = useCreateDeliverySite()

  // call UPDATE hook
  const { mutateAsync: updateDeliverySite, isPending: isUpdatingDeliverySite } = useUpdateDeliverySite()

  // call DELETE hook
  const { mutateAsync: deleteDeliverySite, isPending: isDeletingDeliverySite } = useDeleteDeliverySite()

  // CREATE action
  const handleCreateDeliverySite: MRT_TableOptions<DeliverySite>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateDeliverySite(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createDeliverySite(values)
    table.setCreatingRow(null) // exit creating mode
  }
  
  // UPDATE action
  const handleEditDeliverySite: MRT_TableOptions<DeliverySite>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateDeliverySite(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updateDeliverySite(values)
    table.setEditingRow(null) // exit editing mode
  }

  // DELETE action
  // The self-made confirmation dialog was implemented using the following source as a reference. (2024/08/11).
  // https://codesandbox.io/p/devbox/my-project-7xy36j
  const { isOpen, openDialog, closeDialog, judge, ConfirmDialog } = useConfirmDialog()
  const [ targetRowId, setTargetRowId ] = useState('')
  const openDeleteConfirmModal = async (row: MRT_Row<DeliverySite>) => {
    /*
    if (window.confirm('削除しますか?')) {
      deleteDeliverySite(row.original)
    }
    */
    setTargetRowId(row.original.id.toString())
    const result = await openDialog()
    if (result === 'Yes') {
      deleteDeliverySite(row.original)
    }
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedDeliverySites,
    positionToolbarDropZone: 'none',
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableRowActions: true,
    // enableRowNumbers: true,
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
    muiToolbarAlertBannerProps: isLoadingDeliverySitesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateDeliverySite,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditDeliverySite,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <IconButton onClick={ () => {
            table.setEditingRow(row)
          }}>
          <EditIcon />
        </IconButton>
        <IconButton color='warning' onClick={ () => openDeleteConfirmModal(row) }>
          <DeleteIcon />
        </IconButton>
        <ConfirmDialog
          isOpen={ isOpen && (targetRowId === row.original.id.toString()) }
          onClose={ closeDialog }
          judge={ judge }
          title='削除確認'
          message={ `配送先 ${row.original.name} を削除しますか？` }
        />
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>配送先</Typography>
        <IconButton color='primary' onClick={ () => table.setCreatingRow(true) }>
          <AddCircleOutline />
        </IconButton>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={ table } />
      </Box>
    ),
    state: {
      isLoading: isLoadingDeliverySites,
      isSaving: isCreatingDeliverySite || isUpdatingDeliverySite || isDeletingDeliverySite,
      showAlertBanner: isLoadingDeliverySitesError,
      showProgressBars: isFetchingDeliverySites,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get deliverySite from api)
function useGetDeliverySites() {
  return useQuery<DeliverySite[]>({
    queryKey: [ 'deliverySites' ],
    queryFn: async () => {
      const accessToken = getAccessToken()
      const response = await axios.get(`${ baseURL }/delivery-site`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// CREATE hook (post new deliverySite to api)
function useCreateDeliverySite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (deliverySite: DeliverySite): Promise<DeliverySite> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.post(`${ baseURL }/delivery-site`, deliverySite,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    // client side optimistic update
    onSuccess: (newDeliverySite: DeliverySite) => {
      queryClient.invalidateQueries({ queryKey: ['deliverySites'] })
      queryClient.setQueryData(
        [ 'deliverySites' ],
        (prevDeliverySite: any) => 
          [
            ...prevDeliverySite,
            {
              ...newDeliverySite, 
              id: newDeliverySite.id,
            },
          ] as DeliverySite[],
      )
    },
  })
}

// UPDATE hook (put deliverySite in api)
function useUpdateDeliverySite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (deliverySite: DeliverySite): Promise<DeliverySite> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.put(`${ baseURL }/delivery-site`, deliverySite,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    // client side optimistic update
    onMutate: (newDeliverySite: DeliverySite) => {
      queryClient.setQueryData([ 'deliverySites' ], (prevDeliverySites: any) =>
        prevDeliverySites?.map((prevDeliverySite: DeliverySite) =>
          prevDeliverySite.id === newDeliverySite.id ? newDeliverySite : prevDeliverySite,
        ),
      )
    },
  })
}

// DELETE hook (delete deliverySite in api)
function useDeleteDeliverySite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (deliverySite: DeliverySite) => {
      // send api update request here
      const accessToken = getAccessToken()
      await axios.delete(`${ baseURL }/delivery-site/${ deliverySite.id }`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
    },
    // client side optimistic update
    onMutate: (newDeliverySite: DeliverySite) => {
      queryClient.setQueryData([ 'deliverySites' ], (prevDeliverySites: any) =>
        prevDeliverySites?.filter((deliverySite: DeliverySite) => deliverySite.id !== newDeliverySite.id),
      )
    },
  })
}

const validateRequired = (value: string | number) => value !== undefined && value !== null && value !== ''

function validateDeliverySite(deliverySite: DeliverySite) {
  return {
    name: !validateRequired(deliverySite.name) ? '配送先名は必須です。' : '',
  }
}

export default DeliverySites