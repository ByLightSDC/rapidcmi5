import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpContext } from '../context';
import { registerPing } from './ping';
import { registerListProjects } from './listProjects';
import { registerListCourses } from './listCourses';
import { registerGetCourse } from './getCourse';
import { registerReadCurrentSlide } from './readCurrentSlide';
import { registerUpdateCurrentSlide } from './updateCurrentSlide';
import { registerSaveCourse } from './saveCourse';
import { registerCreateCourse } from './createCourse';
import { registerGetDirectiveFormat } from './getDirectiveFormat';

export function registerAllTools(server: McpServer, ctx: McpContext): void {
  registerPing(server, ctx);
  registerListProjects(server, ctx);
  registerListCourses(server, ctx);
  registerGetCourse(server, ctx);
  registerReadCurrentSlide(server, ctx);
  registerUpdateCurrentSlide(server, ctx);
  registerSaveCourse(server, ctx);
  registerCreateCourse(server, ctx);
  registerGetDirectiveFormat(server);
}
