import {
  courseDataCache,
  currentAu,
  currentBlock,
  currentSlideNum,
  navigateSlide,
  scenario,
  slideDeck,
} from '../../../redux/courseBuilderReducer';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { AuContextProps } from '@rapid-cmi5/cmi5-build-common';

/**
 * AU State & Methods
 * @returns AuContextProps
 */
export const useAuContext = () => {
  const currentSlideIndex = useSelector(currentSlideNum);
  const courseData = useSelector(courseDataCache);
  const currentBlockIndex = useSelector(currentBlock);
  const currentAuIndex = useSelector(currentAu);
  const scenarioSel = useSelector(scenario);
  const slides = useSelector(slideDeck);

  const dispatch = useDispatch();

  const { getLocalFileBlobUrl } = useContext(GitContext);

  //RC5 removal
  const getSlide = (props: AuContextProps) => {
    return null;
  };

  const setCurrentSlideIndex = (slideNum: number) => {
    dispatch(navigateSlide(slideNum));
  };

  return {
    activeTab: currentSlideIndex,
    course: courseData,
    au: courseData.blocks[currentBlockIndex]?.aus?.[currentAuIndex],
    progressPercent: 0,
    viewedSlides: [],
    scenario: scenarioSel,
    slides: slides,
    getSlide,
    setActiveTab: setCurrentSlideIndex,
    setProgress: null,
    getLocalImage: getLocalFileBlobUrl,
    isAuthenticated: false,
    isTestMode: true,
    submitScore: null,
    setActivityCache: null,
    getActivityCache: null,
  } as AuContextProps;
};
