/**
 * Constants for displaying help information 
 */

export const ctfInfoText =
  'Participants solve independent challenges across several categories to “capture flags';
export const jobeInfoText =
  'Hands-on coding and execution environment that allows participants to write and run code inside an isolated sandbox without requiring local setup.';
export const quizInfoText =
  'Structured assessment tool used to measure learner understanding of course material.';
export const scenarioInfoText =
  'A RangeOS Scenario is a fully interactive cybersecurity simulation delivered through a live cyber range environment. It provides structured training content alongside direct console access to systems within the range, allowing learners to perform real-world tasks in a controlled setting.';
export const teamExerciseInfoText =
  'A shared interactive cybersecurity simulation where multiple participants share access to deployed resources.';

export const activitiesInfoText = `| Activity Type      | Description |
|--------------------|-------------|
| Capture The Flag   | Participants solve independent challenges across several categories to “capture flags.” |
| Jobe In The Box    | Hands-on coding and execution environment that allows participants to write and run code inside an isolated sandbox without requiring local setup. |
| Quiz               | Structured assessment tool used to measure learner understanding of course material. |
| RangeOS Scenario   | A fully interactive cybersecurity simulation delivered through a live cyber range environment, providing structured training content alongside direct console access to systems so learners can perform real-world tasks in a controlled setting. |
| Team Exercise      | A shared interactive cybersecurity simulation where multiple participants share access to deployed resources. |
`;

//info main colors (clone theme, same for light and dark mode)
const infoMainColor = '#0288d1';
const infoBorder = '#92CEF5';

/**
 * SVG strings for injecting into table
 */
const codeSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill=${infoMainColor} style="margin-right: 6px; vertical-align: middle;"><path d="m384-336 56-57-87-87 87-87-56-57-144 144 144 144Zm192 0 144-144-144-144-56 57 87 87-87 87 56 57ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>`;

const flagSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    style="margin-right: 6px; vertical-align: middle;"
    fill=${infoMainColor}
  >
    <path d="m14 6-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"></path>
  </svg>`;

const quizSvg = `<svg
xmlns="http://www.w3.org/2000/svg"
height="24px"
viewBox="0 -960 960 960"
width="24px"
style="margin-right: 6px; vertical-align: middle;"
fill=${infoMainColor}
>
<path d="M589.5-372.5Q602-385 602-402t-12.5-29.5Q577-444 560-444t-29.5 12.5Q518-419 518-402t12.5 29.5Q543-360 560-360t29.5-12.5ZM530-488h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
</svg>`;

const terminalSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill=${infoMainColor} style="margin-right: 6px; vertical-align: middle;"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z"/></svg>`;


/**
 * Markdown table for explaining the different activity types 
 */
const borderStyle = `border-bottom:1px solid ${infoBorder}; box-sizing: border-box;`;
const borderRightStyle = `border-right:1px solid ${infoBorder};`;
const paddingStyle = `padding:6px;`;

export const activitiesTable = `<table style="border-collapse: separate; ">
  <colgroup>
    <col style="min-width: 180px;">
    <col>
  </colgroup>
  <thead>
    <tr>
      <th style="${borderStyle}${borderRightStyle}">Activity</th>
      <th style="${borderStyle}">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="${borderStyle}${borderRightStyle}">${flagSvg}Capture The Flag</td>
      <td style="${paddingStyle}${borderStyle}">Participants solve independent challenges across several categories to “capture flags.”</td>
    </tr>
    <tr>
      <td style="${borderStyle}${borderRightStyle}">${codeSvg}Jobe In The Box</td>
      <td style="${paddingStyle}${borderStyle}">Hands-on coding and execution environment that allows participants to write and run code inside an isolated sandbox without requiring local setup.</td>
    </tr>
    <tr >
      <td style="${borderStyle}${borderRightStyle}">${quizSvg}Quiz</td>
      <td style="${paddingStyle}${borderStyle}">Structured assessment tool used to measure learner understanding of course material.</td>
    </tr>
    <tr>
      <td style="${borderStyle}${borderRightStyle}">${terminalSvg}RangeOS Scenario</td>
      <td style="${paddingStyle}${borderStyle}">A fully interactive cybersecurity simulation delivered through a live cyber range environment, providing structured training content alongside direct console access to systems so learners can perform real-world tasks in a controlled setting.</td>
    </tr>
    <tr>
      <td style="${borderRightStyle}">${terminalSvg}Team Exercise</td>
      <td>A shared interactive cybersecurity simulation where multiple participants share access to deployed resources.</td>
    </tr>
  </tbody>
</table>`;
