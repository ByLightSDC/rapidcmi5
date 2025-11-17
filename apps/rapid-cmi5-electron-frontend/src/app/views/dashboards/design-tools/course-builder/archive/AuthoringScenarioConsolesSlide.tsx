// import { AuContextProps, ScenarioContent } from '@rangeos-nx/types/cmi5';

// /**
//  * Slide that displays a Deployed Scenario status, VMs, Containers, and provides Consoles access
//  * Requires ScenarioWrapper at the top of
//  * @returns
//  */
// export default function AuthoringScenarioConsolesSlide({
//   auProps,
// }: {
//   auProps: AuContextProps;
// }) {
//   const { activeTab, scenario, slides } = auProps;

//   const slideContent = slides[activeTab].content as ScenarioContent;
//   const defaultScenarioName = scenario?.name || 'this scenario';

//   return (
//     <div className="hover:prose-a:text-blue-500 prose prose-invert prose-2xl flex-auto mx-20 justify-center">
//       {slideContent.introTitle && (
//         <h2 style={{ textAlign: 'center' }}>{slideContent.introTitle}</h2>
//       )}
//       {slideContent.introContent && <p>{slideContent.introContent}</p>}
//       {!scenario?.uuid && <p>No Scenario Selected...</p>}
//       {scenario?.uuid && (
//         <p>
//           {`Console Access for ${defaultScenarioName} will appear here during
//           lesson`}
//         </p>
//       )}
//     </div>
//   );
// }
