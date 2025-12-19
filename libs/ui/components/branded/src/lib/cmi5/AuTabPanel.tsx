import * as React from 'react';

/** Material **/
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

//import RangeOS_Logo_White from '../../assets/cmi5/RangeOS_Logo_White.png';

import AuProgressBar from './AuProgressBar';
import { AuContextProps, SlideType } from '@rapid-cmi5/cmi5-build/common';

/**
 *
 * @param auProps
 * @returns
 */
export default function AuTabPanel({ auProps }: { auProps: AuContextProps }) {
  const { progressPercent, slides, viewedSlides, activeTab, setActiveTab } =
    auProps;

  const tabClicked = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div
      className="max-w-64 center bg-zinc-900 flex flex-col items-center"
      style={{ maxWidth: '260px' }}
    >
      <div className="z-50 bg-zinc-950 ">
        {/* <img
          alt="logo"
          width="200px" //without this img scales huge, TODO match
          className="p-4 pb-0 filter"
          src={RangeOS_Logo_White}
        /> */}
      </div>

      <AuProgressBar value={progressPercent} />

      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={activeTab}
        onChange={tabClicked}
        scrollButtons={false}
        aria-label="Slides"
        sx={{
          width: '100%',
          backgroundColor: 'zinc-800',
          color: 'white',
        }}
        className="w-full prose text-white"
        textColor="inherit"
      >
        {slides?.map((slide: SlideType, index: number) => (
          <Tab
            sx={{
              backgroundColor: viewedSlides.includes(index)
                ? 'rgba(0, 0, 255, 0.15)'
                : '',
            }}
            key={index}
            label={slide.slideTitle}
          />
        ))}
      </Tabs>
    </div>
  );
}
