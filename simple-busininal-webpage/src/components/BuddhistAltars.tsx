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
import image31 from '@/images/31.webp'
import image45_1 from '@/images/45-1.webp'
import image45_2 from '@/images/45-2.webp'
import image45_3 from '@/images/45-3.webp'
import image64_1 from '@/images/64-1.webp'
import image65_1 from '@/images/65-1.webp'
import image67 from '@/images/67.webp'
import image76 from '@/images/76.webp'
import image77_1 from '@/images/77-1.webp'
import image77_2 from '@/images/77-2.webp'
import image83_1 from '@/images/83-1.webp'
import image83_2 from '@/images/83-2.webp'

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

const BuddhistAltars = () => {
  const [ expanded, setExpanded ] = useState<string | false>('');
  const handleChange =
  (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  }
  const piumaData = [
    {
      img: image31,
      title: 'Piuma',
      rows: 4,
      cols: 5,
    },
  ];
  const hanazakuraData = [
    {
      img: image45_1,
      title: 'Hanazakura_1',
      rows: 1,
      cols: 2,
    },
    {
      img: image45_2,
      title: 'Hanazakura_2',
      rows: 1,
      cols: 1,
    },
    {
      img: image45_3,
      title: 'Hanazakura_3',
      rows: 1,
      cols: 1,
    },
  ];
  const fennel2Data = [
    {
      img: image64_1,
      title: 'Fennel2_1',
      rows: 1,
      cols: 2,
    },
    {
      img: image65_1,
      title: 'Fennel2_2',
      rows: 2,
      cols: 3,
    },
  ];
  const fourLeafData = [
    {
      img: image67,
      title: 'FourLeaf',
      rows: 3,
      cols: 2,
    },
  ];
  const galaData = [
    {
      img: image76,
      title: 'Gala',
      rows: 3,
      cols: 2,
    },
  ];
  const chocolatData = [
    {
      img: image77_1,
      title: 'Chocolat_1',
      rows: 2,
      cols: 3,
    },
    {
      img: image77_2,
      title: 'Chocolat_2',
      rows: 3,
      cols: 3,
    },
  ];
  const progresData = [
    {
      img: image83_1,
      title: 'Progres_1',
      rows: 1,
      cols: 2,
    },
    {
      img: image83_2,
      title: 'Progres_2',
      rows: 2,
      cols: 2,
    },
  ];
  return (
    <>
      { makeAccordionContent('piuma', 'ピウマ', piumaData, 5, expanded, handleChange) }
      { makeAccordionContent('hanazakura', '花桜', hanazakuraData, 2, expanded, handleChange) }
      { makeAccordionContent('fennel2', 'フェンネルⅡ', fennel2Data, 2, expanded, handleChange) }
      { makeAccordionContent('four-leaf', 'フォーリーフ', fourLeafData, 2, expanded, handleChange) }
      { makeAccordionContent('gala', 'ガラ', galaData, 2, expanded, handleChange) }
      { makeAccordionContent('chocolat', 'ショコラ', chocolatData, 3, expanded, handleChange) }
      { makeAccordionContent('progres', 'プログレ', progresData, 2, expanded, handleChange) }
    </>
  )
}

export default BuddhistAltars