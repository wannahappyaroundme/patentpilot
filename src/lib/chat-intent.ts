import type { SearchParams } from "./patents";
import type { Urgency, OrgType } from "./types";

const URGENCY_KEYWORDS: Array<[RegExp, Urgency]> = [
  [/긴급|곧 만료|급|RED|red/, "RED"],
  [/임박|YELLOW|yellow|주의/, "YELLOW"],
  [/일반|GREEN|green/, "GREEN"],
];

const ORG_KEYWORDS: Array<[RegExp, OrgType]> = [
  [/정출연|연구원|연구소|ETRI|KIST|KAIST|연구원의|연구원이/, "GRI"],
  [/대학|산학협력단|대학교/, "UNIV"],
];

interface IpcMapping {
  re: RegExp;
  ipc: string;
  label: string;
}

const IPC_MAP: IpcMapping[] = [
  { re: /배터리|2차전지|이차전지|리튬/, ipc: "H01M,B60L", label: "배터리·2차전지" },
  { re: /반도체|메모리|DRAM|NAND|파운드리|웨이퍼/, ipc: "H01L,G11C", label: "반도체·메모리" },
  { re: /바이오|제약|항체|백신|단백질|세포/, ipc: "A61K,C07K,C12N", label: "바이오·신약" },
  { re: /디스플레이|OLED|LCD|패널/, ipc: "G09G,G02F", label: "디스플레이" },
  { re: /수소|연료전지|태양광|풍력|신재생/, ipc: "F03D,H02J,H01M", label: "에너지·신재생" },
  { re: /자동차|차량|모빌리티|EV|전기차/, ipc: "B60K,B60W,B62D", label: "모빌리티" },
  { re: /5G|통신|네트워크|무선/, ipc: "H04W,H04L", label: "통신·미디어" },
  { re: /AI|인공지능|머신러닝|딥러닝/, ipc: "G06N,G06F", label: "AI·소프트웨어" },
  { re: /선박|조선|LNG/, ipc: "B63B,F17C", label: "조선·해양" },
  { re: /화학|고분자|소재|폴리머/, ipc: "C08F,C08L,C09K", label: "화학·소재" },
  { re: /항공|드론|방산|무기|UAV/, ipc: "B64C,F02C,F41H", label: "항공·방산" },
];

const UNIVERSITY_MAP: Array<[RegExp, string]> = [
  [/연세대|연세/, "연세대학교"],
  [/고려대|고려/, "고려대학교"],
  [/서울대/, "서울대학교"],
  [/한양대|한양/, "한양대학교"],
  [/성균관|성대/, "성균관대학교"],
  [/KAIST|카이스트|한국과학기술원/, "한국과학기술원"],
  [/POSTECH|포스텍|포항공대/, "포항공과대학교"],
  [/UNIST|울산과기/, "울산과학기술원"],
  [/GIST|광주과기/, "광주과학기술원"],
  [/DGIST|대구경북과기/, "대구경북과학기술원"],
  [/ETRI|한국전자통신/, "한국전자통신연구원"],
  [/KIST|한국과학기술연구원/, "한국과학기술연구원"],
  [/한국기계연구원|기계연구원/, "한국기계연구원"],
  [/한국화학연구원|화학연구원/, "한국화학연구원"],
  [/한국에너지기술|에너지기술연구원/, "한국에너지기술연구원"],
  [/한국원자력연구원|원자력연구원/, "한국원자력연구원"],
];

const APPNO_RE = /\b(\d{2})[- ]?(\d{4})[- ]?(\d{6,7})\b/;

export interface ChatIntent {
  kind: "search" | "patent" | "smalltalk";
  params: SearchParams;
  appNo?: string;
  labelHints: string[];
  raw: string;
}

export function parseQuery(raw: string): ChatIntent {
  const text = raw.trim();
  const hints: string[] = [];
  const params: SearchParams = { perPage: 6 };

  const appMatch = text.match(APPNO_RE);
  if (appMatch) {
    const appNo = `${appMatch[1]}-${appMatch[2]}-${appMatch[3]}`;
    return { kind: "patent", params, appNo, labelHints: [appNo], raw: text };
  }

  let urgencyTagged = false;
  for (const [re, val] of URGENCY_KEYWORDS) {
    if (re.test(text)) {
      params.urgency = val;
      hints.push(`${val === "RED" ? "🔴 긴급" : val === "YELLOW" ? "🟡 임박" : "🟢 일반"} 매물`);
      urgencyTagged = true;
      break;
    }
  }

  for (const [re, val] of ORG_KEYWORDS) {
    if (re.test(text)) {
      params.org = val;
      hints.push(val === "GRI" ? "정출연" : "대학");
      break;
    }
  }

  for (const m of IPC_MAP) {
    if (m.re.test(text)) {
      params.ipc = m.ipc;
      hints.push(m.label);
      break;
    }
  }

  for (const [re, name] of UNIVERSITY_MAP) {
    if (re.test(text)) {
      params.university = name;
      hints.push(name);
      break;
    }
  }

  if (/최신|recent|새로/.test(text)) params.sort = "recent";
  else if (/인용|영향력|영향/.test(text)) params.sort = "citations";
  else if (/청구항|광범|넓은/.test(text)) params.sort = "claims";
  else params.sort = "urgency";

  if (!urgencyTagged && !params.org && !params.ipc && !params.university) {
    return { kind: "smalltalk", params, labelHints: hints, raw: text };
  }
  return { kind: "search", params, labelHints: hints, raw: text };
}
