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
import { type Manufacturer } from '@/types/dbFunctions'
import useConfirmDialog  from '@/hooks/useConfirmDialog'

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://8whuj514nf.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const Manufacturers = () => {
  const [ validationErrors, setValidationErrors ] = useState<Record<string, string | undefined>>({})

  const columns = useMemo<MRT_ColumnDef<Manufacturer>[]>(
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
          header: '製造メーカー名',
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
      ],
    [ validationErrors ],
  )
  
  // call READ hook
  const {
    data: fetchedManufacturers = [],
    isError: isLoadingManufacturersError,
    isFetching: isFetchingManufacturers,
    isLoading: isLoadingManufacturers,
  } = useGetManufacturers()

  // call CREATE hook
  const { mutateAsync: createManufacturer, isPending: isCreatingManufacturer } = useCreateManufacturer()

  // call UPDATE hook
  const { mutateAsync: updateManufacturer, isPending: isUpdatingManufacturer } = useUpdateManufacturer()

  // call DELETE hook
  const { mutateAsync: deleteManufacturer, isPending: isDeletingManufacturer } = useDeleteManufacturer()

  // CREATE action
  const handleCreateManufacturer: MRT_TableOptions<Manufacturer>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateManufacturer(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createManufacturer(values)
    table.setCreatingRow(null) // exit creating mode
  }
  
  // UPDATE action
  const handleEditManufacturer: MRT_TableOptions<Manufacturer>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateManufacturer(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updateManufacturer(values)
    table.setEditingRow(null) // exit editing mode
  }

  // DELETE action
  // The self-made confirmation dialog was implemented using the following source as a reference. (2024/08/11).
  // https://codesandbox.io/p/devbox/my-project-7xy36j
  const { isOpen, openDialog, closeDialog, judge, ConfirmDialog } = useConfirmDialog()
  const [ targetRowId, setTargetRowId ] = useState('')
  const openDeleteConfirmModal = async (row: MRT_Row<Manufacturer>) => {
    /*
    if (window.confirm('削除しますか?')) {
      deleteManufacturer(row.original)
    }
    */
    setTargetRowId(row.original.id.toString())
    const result = await openDialog()
    if (result === 'Yes') {
      deleteManufacturer(row.original)
    }
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedManufacturers,
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
    muiToolbarAlertBannerProps: isLoadingManufacturersError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateManufacturer,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditManufacturer,
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
          message={ `製造メーカー ${row.original.name} を削除しますか？` }
        />
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>製造メーカー</Typography>
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
      isLoading: isLoadingManufacturers,
      isSaving: isCreatingManufacturer || isUpdatingManufacturer || isDeletingManufacturer,
      showAlertBanner: isLoadingManufacturersError,
      showProgressBars: isFetchingManufacturers,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get manufacturer from api)
function useGetManufacturers() {
  return useQuery<Manufacturer[]>({
    queryKey: [ 'manufacturers' ],
    queryFn: async () => {
      const response = await axios.get(`${ baseURL }/manufacturer`)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// CREATE hook (post new manufacturer to api)
function useCreateManufacturer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (manufacturer: Manufacturer): Promise<Manufacturer> => {
      // send api update request here
      const response = await axios.post(`${ baseURL }/manufacturer`, manufacturer)
      return response.data
    },
    // client side optimistic update
    onSuccess: (newManufacturer: Manufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      queryClient.setQueryData(
        [ 'manufacturers' ],
        (prevManufacturer: any) => 
          [
            ...prevManufacturer,
            {
              ...newManufacturer, 
              id: newManufacturer.id,
            },
          ] as Manufacturer[],
      )
    },
  })
}

// UPDATE hook (put manufacturer in api)
function useUpdateManufacturer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (manufacturer: Manufacturer): Promise<Manufacturer> => {
      // send api update request here
      const response = await axios.put(`${ baseURL }/manufacturer`, manufacturer)
      return response.data
    },
    // client side optimistic update
    onMutate: (newManufacturer: Manufacturer) => {
      queryClient.setQueryData([ 'manufacturers' ], (prevManufacturers: any) =>
        prevManufacturers?.map((prevManufacturer: Manufacturer) =>
          prevManufacturer.id === newManufacturer.id ? newManufacturer : prevManufacturer,
        ),
      )
    },
  })
}

// DELETE hook (delete manufacturer in api)
function useDeleteManufacturer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (manufacturer: Manufacturer) => {
      // send api update request here
      await axios.delete(`${ baseURL }/manufacturer/${ manufacturer.id }`)
    },
    // client side optimistic update
    onMutate: (newManufacturer: Manufacturer) => {
      queryClient.setQueryData([ 'manufacturers' ], (prevManufacturers: any) =>
        prevManufacturers?.filter((manufacturer: Manufacturer) => manufacturer.id !== newManufacturer.id),
      )
    },
  })
}

const validateRequired = (value: string | number) => value !== undefined && value !== null && value !== ''

function validateManufacturer(manufacturer: Manufacturer) {
  return {
    name: !validateRequired(manufacturer.name) ? '製造メーカー名は必須です。' : '',
  }
}

export default Manufacturers