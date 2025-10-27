import { Dashboard } from "api/js/types/v1/dashboard_pb";
import { Project } from "api/js/types/v1/project_pb";

export const isProjectReadonly = (project: Project): boolean => {
  if (!project.spec?.pointer?.scheme) return false;

  const { case: pointerType, value } = project.spec.pointer.scheme;

  if (pointerType === "localhost") {
    const localPointer = value as any;
    return localPointer.readOnly === true;
  }

  if (pointerType === "remote") {
    return true;
  }

  return false;
};

export const isDashboardReadonly = (dashboard?: Dashboard): boolean => {
  if (!dashboard) return false;
  return dashboard.spec?.isReadonly === true;
};
