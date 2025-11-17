import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ZoomCarousel({ images }: any) {
  const [isEnlarged, setIsEnlarged] = useState(false); // Track whether the carousel is enlarged

  const handleImageClick = () => {
    setIsEnlarged(!isEnlarged); // Enlarge the entire carousel when an image is clicked
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Carousel
        showThumbs={false}
        showStatus={false}
        dynamicHeight={false}
        emulateTouch={true}
        autoFocus={true}
        showIndicators={images.length === 1 ? false : true}
        className={`select-none w-full h-auto p-4 ${
          isEnlarged
            ? 'w-screen z-50 bg-black fixed inset-0 flex items-center justify-center'
            : 'relative z-0 w-full'
        }`}
      >
        {images.map((image: { src: string | undefined }) => {
          return (
            <img
              alt="carousel"
              className={`object-contain rounded-lg ${
                isEnlarged
                  ? 'm-10 max-w-screen-md max-h-[500px]'
                  : 'z-0  max-h-96 w-full'
              }
            `}
              src={image.src}
            />
          );
        })}
      </Carousel>
      {/* <button onClick={handleImageClick} className="btn-rangeos">
        Full Screen
      </button>
      {isEnlarged && (
        <button
          onClick={handleImageClick}
          className="z-50 btn-rangeos fixed bottom-10
            left-1/2 transform -translate-x-1/2 px-4 rounded-xl"
        >
          Exit
        </button>
      )} */}
    </div>
  );
}
