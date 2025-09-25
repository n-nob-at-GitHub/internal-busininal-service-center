'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'

const ErrorDialog = ({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean
  title: string
  message: any
  onClose: () => Promise<unknown>
}) => {
  return (
    <Dialog open={ isOpen } onClose={ onClose }>
      <DialogTitle color='error'>{ title }</DialogTitle>
      <DialogContent>
        <List>
          {
            Object.values(message).filter(v => v).map((messageText: any, messageIndex) => (
              <ListItem key={ messageIndex }>
                <ListItemText slotProps={{ 
                  primary: { sx: { color: 'error.main' } } 
                }}>
                  { messageText }
                </ListItemText>
              </ListItem>
            )) 
          }
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } variant='outlined' color='error' autoFocus>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ErrorDialog
