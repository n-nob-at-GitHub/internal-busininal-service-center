'use client'
import Image, { StaticImageData } from 'next/image'
import {
  ImageList,
  ImageListItem,
} from '@mui/material'
import image116_1 from '@/images/116-1.webp'
import image116_2 from '@/images/116-2.webp'
import image117_1 from '@/images/117-1.webp'
import image117_2 from '@/images/117-2.webp'
import image117_3 from '@/images/117-3.webp'

type ImageItem = {
  img: StaticImageData
  title: string
  cols?: number
  rows?: number
}

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

const PhotoFrames = () => {
  const itemData = [
    {
      img: image116_1,
      title: '',
      rows: 2,
      cols: 2,
    },
    {
      img: image116_2,
      title: '',
      rows: 1,
      cols: 2,
    },
    {
      img: image117_1,
      title: '',
      rows: 1,
      cols: 2,
    },
    {
      img: image117_2,
      title: '',
      rows: 1,
      cols: 2,
    },
    {
      img: image117_3,
      title: '',
      rows: 1,
      cols: 2,
    }
  ];
  return (
    <>
      { makeImageListContent(itemData, 2) }
    </>
  )
}

export default PhotoFrames