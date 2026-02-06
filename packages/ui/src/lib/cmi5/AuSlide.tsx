import { useEffect, useRef, useState } from 'react';
import AuMarkDownSlide from './markdown/MarkDownSlide';
import { AuContextProps, SlideTypeEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * Sample Slide
 * @returns
 */
export default function AuSlide({ auProps }: { auProps: AuContextProps }) {
  const { activeTab, slides } = auProps;
  const slideRef = useRef<HTMLDivElement | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  //layout
  const paddingTop = 'pt-24'; //I prefer 24 'pt-48';

  /** UE resets slide on slide mount */
  useEffect(() => {
    if (isInitialized) {
      return;
    }
    if (!slides || slides?.length === 0 || slides[activeTab] === undefined) {
      return;
    }
    setIsInitialized(true);
  }, [activeTab, slides, isInitialized]);

  /** UE resets scrolltop */
  useEffect(() => {
    if (slideRef.current) {
      slideRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // loading
  if (!slides || slides?.length === 0 || slides[activeTab] === undefined) {
    return <h1>Loading...</h1>;
  }

  return (
    <div
      ref={slideRef}
      className={`h-screen overflow-auto flex justify-center ${paddingTop}`}
    >
      {slides[activeTab].type === SlideTypeEnum.Markdown && (
        <AuMarkDownSlide content={slides[activeTab].content as string} />
      )}
      {slides[activeTab].type === SlideTypeEnum.Scenario && (
        <div>ScenarioConsoles</div>
      )}
    </div>
  );
}
