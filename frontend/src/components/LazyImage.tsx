// components/LazyImage.tsx
import { useInView } from 'react-intersection-observer'
import { FC, useState } from 'react'
import clsx from 'clsx'
import { publicAsset } from '@/utils/imageUrl'

interface LazyImageProps {
    src: string
    alt?: string
    className?: string
    placeholder?: string
}

const LazyImage: FC<LazyImageProps> = ({ src, alt, className, placeholder }) => {
    const fallback = placeholder || publicAsset('placeholder.png')
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
    const [loaded, setLoaded] = useState(false)

    return (
        <div ref={ref} className={clsx('overflow-hidden', className)}>
            {inView ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoaded(true)}
                    className={clsx('transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0') +  ' h-10 w-14  rounded-md object-cover'}
                />
            ) : (
                <img src={fallback} alt="loading" className="opacity-30 h-10 w-14 rounded-md object-cover" />
            )}
        </div>
    )
}

export default LazyImage
