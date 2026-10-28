import { apiRequest } from "@/lib/api/http";
import { asNum, asStr, isObj } from "@/lib/api/normalize";

export type SurveyStatus = 1 | 2 | 3;

export const SURVEY_STATUS = {
  DRAFT: 1,
  ACTIVE: 2,
  CLOSED: 3,
} as const satisfies Record<string, SurveyStatus>;

export type SurveyQuestionKind = "nps" | "choice" | "text";

export type NpsBreakdown = {
  score: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
};

export type SurveyChoice = { id?: number; text: string; score: number };

export type SurveyQuestion = {
  id?: number;
  kind: SurveyQuestionKind;
  text: string;
  isRequired: boolean;
  choices: SurveyChoice[];
};

export type SurveyListItem = {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  statusDisplay: string;
  isOpen: boolean;
  bootcampEventId: number;
  bootcampId: number;
  bootcampTitle: string;
  bootcampSession: string;
  instructorId: number;
  instructorName: string;
  activatedAt: string | null;
  closesAt: string | null;
  invitedCount: number;
  responseCount: number;
  nps: NpsBreakdown;
  createdAt: string;
};

export type SurveyDetail = SurveyListItem & {
  /** Raw (possibly empty) title for editing; `title` is the display title. */
  rawTitle: string;
  questions: SurveyQuestion[];
};

export type SurveyInput = {
  bootcampEventId: number;
  instructorId: number;
  title: string;
  description: string;
  closesAt: string | null;
  questions: SurveyQuestion[];
};

export type SurveyFormEvent = {
  id: number;
  bootcampId: number;
  bootcampTitle: string;
  session: string;
  statusDisplay: string;
  confirmedCount: number;
  instructors: { id: number; fullName: string }[];
};

export type SurveyFormOptions = {
  events: SurveyFormEvent[];
  defaultQuestions: SurveyQuestion[];
};

type QuestionReportBase = { id: number; text: string; answerCount: number };

export type SurveyQuestionReport =
  | (QuestionReportBase & {
      kind: "nps";
      nps: NpsBreakdown;
      average: number | null;
      distribution: { score: number; count: number }[];
    })
  | (QuestionReportBase & {
      kind: "choice";
      average: number | null;
      maxScore: number;
      choices: { id: number; text: string; score: number; count: number; percent: number }[];
    })
  | (QuestionReportBase & {
      kind: "text";
      answers: { text: string; createdAt: string }[];
    });

export type SurveyReport = {
  invitedCount: number;
  responseCount: number;
  responseRate: number;
  nps: NpsBreakdown;
  questions: SurveyQuestionReport[];
};

export type SurveyListParams = {
  status?: SurveyStatus;
  instructor?: number;
  bootcampEvent?: number;
  search?: string;
};

type Raw = Record<string, unknown>;

const obj = (value: unknown): Raw => (isObj(value) ? value : {});
const list = (value: unknown): Raw[] => (Array.isArray(value) ? value.map(obj) : []);
const num = (value: unknown) => asNum(value) ?? 0;
const str = (value: unknown) => asStr(value) ?? "";

function normalizeNps(value: unknown): NpsBreakdown {
  const raw = obj(value);
  return {
    score: asNum(raw.score),
    promoters: num(raw.promoters),
    passives: num(raw.passives),
    detractors: num(raw.detractors),
    total: num(raw.total),
  };
}

function normalizeQuestion(value: unknown): SurveyQuestion {
  const raw = obj(value);
  return {
    id: asNum(raw.id) ?? undefined,
    kind: (str(raw.kind) || "text") as SurveyQuestionKind,
    text: str(raw.text),
    isRequired: raw.is_required !== false,
    choices: list(raw.choices).map((choice) => ({
      id: asNum(choice.id) ?? undefined,
      text: str(choice.text),
      score: num(choice.score),
    })),
  };
}

function normalizeListItem(value: unknown): SurveyListItem {
  const raw = obj(value);
  return {
    id: num(raw.id),
    title: str(raw.display_title) || str(raw.title),
    description: str(raw.description),
    status: num(raw.status) as SurveyStatus,
    statusDisplay: str(raw.status_display),
    isOpen: raw.is_open === true,
    bootcampEventId: num(raw.bootcamp_event_id),
    bootcampId: num(raw.bootcamp_id),
    bootcampTitle: str(raw.bootcamp_title),
    bootcampSession: str(raw.bootcamp_session),
    instructorId: num(raw.instructor_id),
    instructorName: str(raw.instructor_name),
    activatedAt: asStr(raw.activated_at),
    closesAt: asStr(raw.closes_at),
    invitedCount: num(raw.invited_count),
    responseCount: num(raw.response_count),
    nps: normalizeNps(raw.nps),
    createdAt: str(raw.created_at),
  };
}

function normalizeDetail(value: unknown): SurveyDetail {
  const raw = obj(value);
  return {
    ...normalizeListItem(raw),
    rawTitle: typeof raw.title === "string" ? raw.title : "",
    questions: list(raw.questions).map(normalizeQuestion),
  };
}

function normalizeReport(value: unknown): SurveyReport {
  const raw = obj(value);
  return {
    invitedCount: num(raw.invited_count),
    responseCount: num(raw.response_count),
    responseRate: num(raw.response_rate),
    nps: normalizeNps(raw.nps),
    questions: list(raw.questions).map((q): SurveyQuestionReport => {
      const base = { id: num(q.id), text: str(q.text), answerCount: num(q.answer_count) };
      if (q.kind === "nps") {
        return {
          ...base,
          kind: "nps",
          nps: normalizeNps(q.nps),
          average: asNum(q.average),
          distribution: list(q.distribution).map((d) => ({
            score: num(d.score),
            count: num(d.count),
          })),
        };
      }
      if (q.kind === "choice") {
        return {
          ...base,
          kind: "choice",
          average: asNum(q.average),
          maxScore: num(q.max_score),
          choices: list(q.choices).map((c) => ({
            id: num(c.id),
            text: str(c.text),
            score: num(c.score),
            count: num(c.count),
            percent: num(c.percent),
          })),
        };
      }
      return {
        ...base,
        kind: "text",
        answers: list(q.answers).map((a) => ({
          text: str(a.text),
          createdAt: str(a.created_at),
        })),
      };
    }),
  };
}

function toWriteBody(input: Partial<SurveyInput>) {
  const body: Record<string, unknown> = {};
  if (input.bootcampEventId !== undefined) body.bootcamp_event_id = input.bootcampEventId;
  if (input.instructorId !== undefined) body.instructor_id = input.instructorId;
  if (input.title !== undefined) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.closesAt !== undefined) body.closes_at = input.closesAt;
  if (input.questions !== undefined) {
    // Ids let the backend apply wording edits in place once a survey has responses.
    body.questions = input.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      text: q.text,
      is_required: q.isRequired,
      choices:
        q.kind === "choice"
          ? q.choices.map((c) => ({ id: c.id, text: c.text, score: c.score }))
          : [],
    }));
  }
  return body;
}

const BASE = "/panel/admin/surveys/";

export const surveysApi = {
  async list(params: SurveyListParams = {}): Promise<SurveyListItem[]> {
    const payload = await apiRequest<unknown>(BASE, {
      searchParams: {
        status: params.status,
        instructor: params.instructor,
        bootcamp_event: params.bootcampEvent,
        search: params.search?.trim(),
      },
    });
    return Array.isArray(payload) ? payload.map(normalizeListItem) : [];
  },

  async get(id: number): Promise<SurveyDetail> {
    return normalizeDetail(await apiRequest<unknown>(`${BASE}${id}/`));
  },

  async create(input: SurveyInput): Promise<SurveyDetail> {
    const payload = await apiRequest<unknown>(BASE, {
      method: "POST",
      body: toWriteBody(input),
    });
    return normalizeDetail(payload);
  },

  async update(id: number, input: Partial<SurveyInput>): Promise<SurveyDetail> {
    const payload = await apiRequest<unknown>(`${BASE}${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return normalizeDetail(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`${BASE}${id}/`, { method: "DELETE" });
  },

  async activate(id: number): Promise<SurveyDetail> {
    return normalizeDetail(await apiRequest<unknown>(`${BASE}${id}/activate/`, { method: "POST" }));
  },

  async close(id: number): Promise<SurveyDetail> {
    return normalizeDetail(await apiRequest<unknown>(`${BASE}${id}/close/`, { method: "POST" }));
  },

  async report(id: number): Promise<SurveyReport> {
    return normalizeReport(await apiRequest<unknown>(`${BASE}${id}/report/`));
  },

  async formOptions(): Promise<SurveyFormOptions> {
    const raw = obj(await apiRequest<unknown>(`${BASE}form-options/`));
    return {
      events: list(raw.events).map((event) => ({
        id: num(event.id),
        bootcampId: num(event.bootcamp_id),
        bootcampTitle: str(event.bootcamp_title),
        session: str(event.session),
        statusDisplay: str(event.status_display),
        confirmedCount: num(event.confirmed_count),
        instructors: list(event.instructors).map((i) => ({
          id: num(i.id),
          fullName: str(i.full_name),
        })),
      })),
      defaultQuestions: list(raw.default_questions).map(normalizeQuestion),
    };
  },
};

/** Aggregate several surveys' NPS (e.g. an instructor's overall score). */
export function combineNps(items: NpsBreakdown[]): NpsBreakdown {
  const promoters = items.reduce((sum, item) => sum + item.promoters, 0);
  const passives = items.reduce((sum, item) => sum + item.passives, 0);
  const detractors = items.reduce((sum, item) => sum + item.detractors, 0);
  const total = promoters + passives + detractors;
  return {
    score: total ? Math.round(((promoters - detractors) * 100) / total) : null,
    promoters,
    passives,
    detractors,
    total,
  };
}
