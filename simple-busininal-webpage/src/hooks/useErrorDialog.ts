import { useCallback, useMemo, useState } from 'react'
import ErrorDialog from '@/app/ErrorDialog'

const useErrorDialog = () => {
  const [ isErrorDialogOpen, setIsErrorDialogOpen ] = useState<boolean>(false)

  const openErrorDialog = useCallback(() => {
    setIsErrorDialogOpen(true)
  }, [])

  const closeErrorDialog = useCallback(() => {
    return new Promise<unknown>((resolve) => {
      setIsErrorDialogOpen(false)
      resolve(null)
    })
  }, [])

  return useMemo(() => {
    return {
      isErrorDialogOpen,
      ErrorDialog,
      openErrorDialog,
      closeErrorDialog,
    }
  }, [ isErrorDialogOpen, openErrorDialog, closeErrorDialog ])
}

export default useErrorDialog
