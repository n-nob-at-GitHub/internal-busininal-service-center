'use client'
import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import {
  ImageList,
  ImageListItem,
  styled,
  Typography,
} from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import image150_1 from '@/images/150-1.webp'
import image150_2 from '@/images/150-2.webp'
import image150_3 from '@/images/150-3.webp'
import image151_1 from '@/images/151-1.webp'
import image151_2 from '@/images/151-2.webp'
import image151_3 from '@/images/151-3.webp'

type ImageItem = {
  img: StaticImageData
  title: string
  cols?: number
  rows?: number
}

// https://mui.com/material-ui/react-accordion/
const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={ 0 } square { ...props } />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={ <ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} /> }
    { ...props }
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${ accordionSummaryClasses.expandIconWrapper }.${ accordionSummaryClasses.expanded }`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${ accordionSummaryClasses.content }`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const makeImageListContent = (data: ImageItem[], maxCols = 1) => {
  return <ImageList 
    cols={ maxCols }
    sx={{
      '& .MuiImageListItem-root': {
        position: 'relative',
      },
    }}>
    { data.map((item, index) => (
      <ImageListItem 
        key={ index }
        cols={ item.cols }
        rows={ item.rows }
        sx={{
          aspectRatio: `${ item.cols } / ${ item.rows }`,
          border: 1, 
          borderColor: 'grey.200', 
          p: 2,
          position: 'relative',
        }}>
        <Image
          src={ item.img.src }
          alt={ item.title }
          loading='lazy'
          fill
          style={{ objectFit: 'cover' }}
        />
      </ImageListItem>
    ))}
  </ImageList>;
}

const makeAccordionContent = (
  key: string, 
  title: string, 
  data: ImageItem[], 
  maxCols = 1, 
  expanded: string | boolean, 
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
) => {
  return <Accordion expanded={ expanded === key } onChange={ handleChange(key) }>
    <AccordionSummary aria-controls={ `${ key }-content` } id={`${ key }-header`}>
      <Typography component='span'>{ title }</Typography>
    </AccordionSummary>
    <AccordionDetails>
      { makeImageListContent(data, maxCols) }
    </AccordionDetails>
  </Accordion>;
}

const Rosaries = () => {
  const [ expanded, setExpanded ] = useState<string | false>('');
  const handleChange =
  (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  }
  const fioriData = [
    {
      img: image150_1,
      title: '',
      rows: 1,
      cols: 3,
    },
    {
      img: image150_2,
      title: '',
      rows: 2,
      cols: 3,
    },
  ];

  const fioriFringeData = [
    {
      img: image150_3,
      title: '',
      rows: 1,
      cols: 3,
    },
  ];
  const laVenezianaData = [
    {
      img: image151_1,
      title: '',
      rows: 1,
      cols: 3,
    },
    {
      img: image151_2,
      title: '',
      rows: 1,
      cols: 3,
    },
    {
      img: image151_3,
      title: '',
      rows: 1,
      cols: 3,
    },
  ];
  return (
    <>
      { makeAccordionContent('fiori', 'フィオーリ', fioriData, 3, expanded, handleChange) }
      { makeAccordionContent('fiori-fringe', 'フィオーリフリンジ', fioriFringeData, 3, expanded, handleChange) }
      { makeAccordionContent('la-veneziana', 'ラ・ヴェネツィアーナ', laVenezianaData, 3, expanded, handleChange) }
    </>
  )
}

export default Rosaries