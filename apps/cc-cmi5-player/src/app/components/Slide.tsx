import { useRef } from 'react';
import {
  CTFContent,
  JobeContent,
  QuizContent,
  ScenarioContent,
  SlideTypeEnum,
  SourceDocContent,
} from '@rangeos-nx/types/cmi5';
import ScenarioConsoles from './scenario/ScenarioConsoles';
import ScenarioWrapper from './scenario/ScenarioWrapper';
import {
  AuCTF,
  AuMarkDownSlide,
  AuQuiz,
  AuSourceDocSlide,
  JobeInTheBox,
} from '@rangeos-nx/ui/branded';
import { config } from '@rangeos-nx/frontend/environment';
import { AuContextProps } from '@rangeos-nx/types/cmi5';

function Slide({
  auProps,
  isSplitPanelShown,
}: {
  auProps: AuContextProps;
  isSplitPanelShown: boolean;
}) {
  const { activeTab, slides } = auProps;
  const slideRef = useRef<HTMLDivElement>(null); // TypeScript typing for the ref

  const fontSize = !isSplitPanelShown ? 'prose-lg' : 'prose-md';

  const bgImgStyle = config?.THEME?.SLIDE_BACKGROUND
    ? 'bg-contain bg-center bg-no-repeat bg-black bg-[url("' +
      config.THEME.SLIDE_BACKGROUND +
      '")]'
    : '';

  const slideBgClassName = !isSplitPanelShown ? `${bgImgStyle}` : ``;

  // loading
  if (!slides || slides?.length === 0 || slides[activeTab] === undefined) {
    return <h1>Loading...</h1>;
  }
  return (
    <div
      id="resizable-wrapper"
      ref={slideRef}
      style={{
        marginLeft: 'clamp(20px, 2%, 100%)',
        marginRight: 'clamp(20px, 2%, 100%)',
      }}
    >
      <div
        className={slideBgClassName}
        style={{
          margin: 'auto',
          width: '100%',
        }}
      >
        <ScenarioWrapper>
          {slides[activeTab].type === SlideTypeEnum.Markdown && (
            <AuMarkDownSlide
              auProps={auProps}
              content={slides[activeTab].content as string}
              slideTop={0}
              slideHeight={slideRef.current?.clientHeight || 0}
              slideWidth={slideRef.current?.clientWidth || 0}
            />
          )}
          {slides[activeTab].type === SlideTypeEnum.SourceDoc && (
            <AuSourceDocSlide
              introContent={
                (slides[activeTab].content as SourceDocContent).introContent
              }
              sourceDoc={
                slides[activeTab].content
                  ? (slides[activeTab].content as SourceDocContent).sourceDoc
                  : ''
              }
              styleProps={
                (slides[activeTab].content as SourceDocContent).styleProps
              }
              slideTop={0}
              slideHeight={slideRef.current?.clientHeight || 0}
              slideWidth={slideRef.current?.clientWidth || 0}
            />
          )}
          {slides[activeTab].type === SlideTypeEnum.Scenario && (
            <ScenarioConsoles
              auProps={auProps}
              content={auProps?.slides[activeTab].content as ScenarioContent}
            />
          )}
          {slides[activeTab].type === SlideTypeEnum.Quiz && (
            <div
              className={`w-full prose-xl text-white px-4 mx-auto ${fontSize}`}
            >
              {
                <AuQuiz
                  // We need to give it a key so that react will reset state
                  key={activeTab}
                  auProps={auProps}
                  content={auProps?.slides[activeTab].content as QuizContent}
                />
              }
            </div>
          )}

          {slides[activeTab].type === SlideTypeEnum.CTF && (
            <div className={`w-full prose-xl text-white font-bold`}>
              <AuCTF
                auProps={auProps}
                content={auProps?.slides[activeTab].content as CTFContent}
              />
            </div>
          )}
          {slides[activeTab].type === SlideTypeEnum.JobeInTheBox && (
            <JobeInTheBox
              auProps={auProps}
              content={auProps?.slides[activeTab].content as JobeContent}
            />
          )}
        </ScenarioWrapper>
      </div>
    </div>
  );
}

export default Slide;
