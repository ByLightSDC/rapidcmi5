import { http, HttpResponse } from 'msw';

const configResponse = {
  auName: 'intro',
  dirPath: 'net_exam_a/intro',
  slides: [
    {
      slideTitle: 'Mico hello',
      type: 'markdown',
      filepath: 'net_exam_a/intro/exam.md',
      content: 'Test Paragraph',
    },
    {
      slideTitle: 'Exam',
      type: 'markdown',
      filepath: 'net_exam_a/intro/exam.md',
      content:
        ':::scenario\n```json\n{\n "uuid": "558a535d-6087-4bb3-b341-9683a3594328",\n "name": "test",\n "promptClass": false,\n "moveOnCriteria": "completed",\n "defaultClassId": "net_a",\n "rc5id": "20260107133844-9510a34a-046b-428b-ad15-ef0093208f3b"\n}\n```\n:::\n\n\n\n:::quiz\n```json\n{\n "cmi5QuizId": "quiz",\n "completionRequired": "completed-and-passed",\n "moveOnCriteria": "completed-and-passed",\n "passingScore": 80,\n "questions": [\n  {\n   "question": "aaaa",\n   "type": "freeResponse",\n   "typeAttributes": {\n    "correctAnswer": "aaaaa",\n    "grading": "exact"\n   },\n   "cmi5QuestionId": "quiz_q1"\n  },\n  {\n   "question": "tttt",\n   "type": "freeResponse",\n   "typeAttributes": {\n    "correctAnswer": "tttt",\n    "grading": "exact"\n   },\n   "cmi5QuestionId": "quiz_q2"\n  }\n ],\n "title": "Quiz",\n "rc5id": "20260203144730-168b4ad2-5102-4ff5-9f64-78a591632273"\n}\n```\n:::\n\n\n\n:::note{title="Note" collapse="closed"}\ntest\n:::\n\n\n\n\n\n\n\n\n\n:::danger{title="Danger" collapse="closed"}\naaaa\n:::\n\n::::accordion{style="margin: 4px;"}\n:::accordionContent{title="Accordion 1 Title"}\nAccordion 1 Content Goes Here\n:::\n\n:::accordionContent{title="Accordion 2 Title"}\nAccordion 2 Content Goes Here\n:::\n\n:::accordionContent{title="Accordion 3 Title"}\nAccordion 3 Content Goes Here\n:::\n::::',
    },
    {
      slideTitle: 'Exam Completion',
      type: 'markdown',
      filepath: 'net_exam_a/intro/exam-completion.md',
      content:
        '---\nanimations:\n  - id: anim_1770148133980_6oy0eke0g\n    order: 1\n    targetNodeKey: "113"\n    directiveId: anim_1770148133961_gc0hya\n    targetLabel: "Paragraph: aaaaa"\n    entranceEffect: fadeIn\n    trigger: onSlideOpen\n    duration: 5\n    delay: 0\n    enabled: true\n---\n\n:::quiz\n```json\n{\n "cmi5QuizId": "course-complete",\n "completionRequired": "completed-and-passed",\n "moveOnCriteria": "completed-and-passed",\n "passingScore": 80,\n "questions": [\n  {\n   "question": "CompleteType in : \\"Complete\\" in order to finish the exam.",\n   "type": "freeResponse",\n   "typeAttributes": {\n    "correctAnswer": "Complete",\n    "grading": "exact"\n   },\n   "cmi5QuestionId": "course-complete_q1"\n  }\n ],\n "title": "Course Completion Acknowledgement",\n "rc5id": "20260107133936-29a4bfa0-a3e9-4d0b-9b3b-a0ca37bfe329"\n}\n```\n:::\n\n::::accordion{style="margin: 4px;"}\n:::accordionContent{title="Accordion 1 Title"}\nAccordion 1 Content Goes Here\n:::\n\n:::accordionContent{title="Accordion 2 Title"}\nAccordion 2 Content Goes Here\n:::\n\n:::accordionContent{title="Accordion 3 Title"}\nAccordion 3 Content Goes Here\n:::\n::::\n\n::::tabs{style="margin: 4px;"}\n:::tabContent{title="Tab 1 Title"}\nTab 1 Content Goes Herase\n:::\n\n:::tabContent{title="Tab 2 Title"}\nTab 2 Content Goes Here\n:::\n\n:::tabContent{title="Tab 3 Title"}\nTab 3 Content Goes Here\n:::\n::::\n\n:::anim{#anim_1770148133961_gc0hya}\naaaaa\n\n\n\n\n\n\n\n\n\n:fx[sssssssssss]{type="box" color="#aa0000"}\n:::',
    },
  ],
  teamSSOEnabled: false,
  rangeosScenarioName: 'test',
  rangeosScenarioUUID: '558a535d-6087-4bb3-b341-9683a3594328',
  promptClassId: false,
  defaultClassId: 'net_a',
  ksats: [],
};

export const lessonContent = [
  http.get(`/config.json`, ({ request, params, cookies }) => {
    return HttpResponse.json(configResponse, { status: 200 });
  }),
];
