import { USER_TYPE } from '../models/user/userType';

export const FORM_STATUSES: any = {
  IN_PROGRESS: { key: 'IN_PROGRESS', label: 'IN PROGRESS', class: 'alert-warning' },
  NOT_STARTED: { key: 'NOT_STARTED', label: 'NOT STARTED', class: 'alert-secondary' },
  UNDER_REVIEW_BY_STATE: {
    key: 'UNDER_REVIEW_BY_STATE',
    label: 'UNDER REVIEW BY STATE',
    class: 'alert-info',
    roles: [USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC],
  },
  RETURNED_BY_STATE: {
    key: 'RETURNED_BY_STATE',
    label: 'RETURNED BY STATE',
    class: 'alert-danger',
  },
  UNDER_REVIEW_BY_XVIFC: {
    key: 'UNDER_REVIEW_BY_XVIFC',
    label: 'UNDER REVIEW BY XVIFC',
    class: 'alert-info',
    roles: [USER_TYPE.XVIFC],
  },
  RETURNED_BY_XVIFC: {
    key: 'RETURNED_BY_XVIFC',
    label: 'RETURNED BY XVIFC',
    class: 'alert-danger',
  },
  APPROVED_BY_XVIFC: {
    key: 'APPROVED_BY_XVIFC',
    label: 'APPROVED BY XVIFC',
    class: 'alert-success',
  },
};
