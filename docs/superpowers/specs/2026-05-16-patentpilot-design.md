# PatentPilot — 설계 명세서

> 한국 대학·정출연 R&D 특허 유지비 매물 매매 중개 AI 코파일럿
>
> 2026 지식재산 데이터 활용 창업 경진대회 (마감 2026-06-11) 출품작
> 작성일: 2026-05-16 · 작성: TreeO 팀 + Claude
> 상위 문서: `TreeO_프로젝트_기획서_v1.md`, `TreeO_1주_집중_기획_스프린트.md`

---

## 0. 한 줄 요약

**PatentPilot은 한국 대학·정출연이 보유한 R&D 특허 37만 건 중 곧 유지비를 포기할 매물을 발굴해, 그 기술을 필요로 하는 기업과 매칭하는 거래 코파일럿이다. 거래 성사 시 매칭 수수료로 수익화한다.**

---

## 1. 배경과 전제

### 1.1 시장 문제
- 한국 IP 정보서비스 시장은 미국의 1/10. 정출연·대학 R&D 특허의 사업화율은 한 자릿수로 추정.
- 한국 특허 존속기간은 출원일로부터 20년. 4년차부터 연차료 납부, 7년차 이후 급격히 증가.
- 미국·해외 특허는 등록 후 **3.5년 / 7.5년 / 11.5년** 시점에 maintenance fee 납부. 이 시점이 다가오면 권리자는 유지 vs 포기 의사결정 압박을 받는다.
- 대학·정출연은 보유 특허 수백~수만 건의 모든 유지비를 부담하기 어려워, **납부 시점 직전이 매도 동기 최강 구간**이다.
- 기업은 한국 공공 R&D 특허를 *찾을 도구* 자체가 없다. KIPRIS는 검색만 가능하고, 매도 의향 정보·매칭 채널이 없다.

### 1.2 보유 자산
| 자산 | 내용 |
|---|---|
| KIPRIS Plus 유료 API로 확보한 특허 데이터 | `Data/patents.csv` 370,666건 (대학 62.5% / 정출연 37.4%) |
| | `legalStatus.csv` 3,467,969행 (연차료납부·연차료미납·포기 등 상태 코드) |
| | `transfers.csv` 1,468,561행 (이전 이력) |
| | `claims.csv`, `citationsV3.csv`, `citings.csv`, `familiesDetail.csv`, `trials.csv`, `amendments.csv` |
| GitHub 계정 | `github.com/wannahappyaroundme` |

### 1.3 데이터 발견 (2026-05-16 분석)
- 37만 건 = 대학(231,683) + 정출연(138,442) + 기타(541)
- 출원 2006~2011 (15~20년차) 매물 후보 78,075건, 그 중 권리 유효 78,003건
- legalStatus에 `연차료납부` 99,787건, `연차료미납` 82,238건, `포기(등록료 미납)` 1,037건 — 유지비 시그널을 직접 활용 가능
- 등록결정 특허: 272,924건 (등록결정 일반 + 재심사후 + 심사전치후 등)
- Top 정출연: ETRI(44,005) · KAIST(15,454) · KIST(10,619) · 한국기계연구원 · 한국화학연구원 ...
- Top 대학: 연세대(9,880) · 고려대(9,711) · 서울대(9,651) · 한양대 · 성균관대 ...

---

## 2. 서비스 정체성

| 항목 | 값 |
|---|---|
| **이름** | PatentPilot (한글 표기: 페이턴트파일럿) |
| **상위 브랜드** | TreeO (장기 인프라 비전) |
| **포지셔닝** | 유지비 매물 매매 중개 단일 포커스 (B2B2B Two-Sided Marketplace) |
| **카피라이트** | "잠자는 한국 R&D 특허, 깨어날 시간입니다" |
| **도메인 (대회 제출용)** | `patentpilot.vercel.app` (Vercel 기본 서브도메인, 무료) |
| **저장소** | `github.com/wannahappyaroundme/patentpilot` |

### 2.1 비즈니스 모델
| 수익원 | 가격 | 비고 |
|---|---|---|
| 거래 성사 매칭 수수료 | 거래액의 5~10% | 매도·매수 양측 분배 가능 |
| 매수측 거래 신청료 (LOI) | 건당 5~10만원 | 검색·열람은 무료 |
| TLO 대시보드 구독 | 월 50만원~ | Phase 2 도입 |
| 매도측 매물 등록 | 무료 | 공급 풀 확보 우선 |

### 2.2 5 페르소나 → 2 페르소나 축소
기획서 v1의 5 페르소나(기업R&D · TLO · 교수 · VC · 정책연구자) 중 **시제품 작동 대상은 매도측·매수측 2명만**. 나머지는 사업계획서에 "확장 시나리오" 한 단락.

---

## 3. 페르소나 2개

### 3.1 매도측 — 김지영 / 산학협력단 TLO 매니저 (대학) + 정출연 기술이전팀
- **트리거**: 연차료 납부일 임박 + 누적 유지비 vs 사업화 가능성 저조
- **결정 권한**: 기관 내 매물 등록·가격 협상 (단, 본부 승인 필요한 케이스 다수)
- **수요**: 매수 후보 기업 자동 발굴 · 거래 절차 자동화 · 기술이전 KPI 달성
- **데이터에서 잡히는 시그널**:
  - `patUniversityName` (231 + 138 = 약 370 기관)
  - `patFinalDisposal = 등록결정 *`
  - `patLegalStatus = 연차료납부` (현재 유지 중)
  - `patTransferCount = 0` (아직 이전 안 됨)

### 3.2 매수측 — 박상훈 / 중견 기업 R&D 팀장
- **트리거**: 외주 R&D 비용 부담 · 신기술 도입 압박 · 경쟁사 특허 회피
- **결정 권한**: 기술 라이선스/매입 의사결정 (CTO 단계 결재)
- **수요**: 자기 기술분야 매물 알림 · 매도 기관 컨택 · 가격 협상 · KIPRIS 원문 검토
- **데이터에서 잡히는 시그널**: 데이터셋에 매수 기업 정보가 **없음**. 외부 보강 필요:
  - DART(전자공시) 무료 API → 기업명·업종·매출
  - 시제품용 시드: 배터리·반도체·바이오·에너지·디스플레이 등 핵심 산업 상장사 30~50개 수동 큐레이션

---

## 4. 매물 풀 정의

### 4.1 3단계 긴급도 태그
| 태그 | 정의 | 매물 수 (추정) | 매수측 매력도 |
|---|---|---:|---|
| 🔴 긴급 | 출원 2006~2011 + `연차료납부` + `transferCount=0` + 잔여권리 0~5년 + 11.5년 fee 임박 | 3~5만건 | 컬렉션·표준특허·후속 출원 베이스 |
| 🟡 임박 | 출원 2012~2017 + `연차료납부` + `transferCount=0` + 잔여 6~13년 + 7.5년 fee 구간 | 6~8만건 | 매수 매력도 최강 — 시제품 디폴트 |
| 🟢 일반 | 출원 2018~2022 + `연차료납부` | 10만건+ | 일반 라이선싱 |

**시제품 디폴트 필터: 🔴 + 🟡 (총 약 10만건)**

### 4.2 매물 풀에서 제외
- `patFinalDisposal`이 `거절결정 *`, `취하 *` — 등록 안 됨
- `patLegalStatus = 포기(등록료 미납)` 또는 `연차료미납` — 이미 포기/포기 직전
- `patExpirationDate < 2026-05-16` — 이미 만료

### 4.3 매수 후보 기업 매핑 (시드)
첫 시드 30~50개사:
- **배터리**: LG에너지솔루션 · 삼성SDI · SK온 · 포스코퓨처엠 · 에코프로비엠
- **반도체**: 삼성전자 · SK하이닉스 · DB하이텍 · LX세미콘
- **바이오**: 삼성바이오로직스 · 셀트리온 · 한미약품 · 유한양행 · GC녹십자
- **디스플레이**: LG디스플레이 · 삼성디스플레이
- **에너지**: 한화솔루션 · 두산퓨얼셀 · 효성첨단소재
- **소재/화학**: LG화학 · 한화에어로스페이스 · 포스코홀딩스
- ...총 30~50개

각 기업에 대해 IPC 보유 패턴 가중치 사전 큐레이션 (Phase 1) → DART/외부 데이터 자동 보강 (Phase 2).

---

## 5. 매칭 로직

### 5.1 1차 — 룰베이스 (시제품에 즉시 작동)
매칭 점수 = `IPC 적합도 (60%) + 기업 R&D 규모 (20%) + 협력 이력 (20%)`
- **IPC 적합도**: 매물의 주 IPC 코드 vs 기업의 IPC 보유 패턴 (시드 매핑)
- **기업 R&D 규모**: 기업 매출 × R&D 집약도 (DART 또는 수동 큐레이션)
- **협력 이력**: `patRndDepartment` 또는 `transfers` 내역에 기업 등장 가산점

### 5.2 2차 — AI 임베딩 (W3 stretch)
- 매물 제목·초록 임베딩 (OpenAI text-embedding-3-small 또는 KorPatBERT)
- 기업 사업개요 텍스트 임베딩 (DART 사업개요)
- 코사인 유사도 Top-K + 1차 룰베이스 점수 결합

### 5.3 채팅 코파일럿 (W3 stretch)
- 자연어 질문 → Intent 분류 (매물 검색 / 가격 추정 / 매수 기업 추천)
- LLM (OpenAI GPT-4o-mini, 비용 月 $5~10 예산) + RAG (매물 메타 + 매칭 결과)
- 시제품 미작동 시 미리 녹화한 데모 영상으로 대체

---

## 6. 정보 구조 (5화면)

| # | 화면 | 핵심 요소 | 작동 우선순위 |
|---|---|---|---|
| 1 | **랜딩** | 헤드라인 · 가치 제안 3블록 · 라이브 카운터(전체 매물·🔴매물) · CTA 2개(매물 찾기·매물 등록) · 데모 영상 | W1 필수 |
| 2 | **매물 리스트** | 좌 필터(IPC·기관 유형·기관명·긴급도·잔여년) · 중 카드 리스트 · 우 통계 패널 | W2 필수 |
| 3 | **매물 상세** | 메타 카드 · KIPRIS 원문 새창 링크 · 매수 후보 기업 Top 5 · 거래 신청 CTA | W2 필수 |
| 4 | **AI 코파일럿 (채팅)** | 자연어 질문 → 매물·매칭 추천 | W3 stretch |
| 5 | **거래 신청 폼 + About** | LOI 폼 (lead 수집, Supabase 저장) · 팀·비전 | W2 필수 |

### 6.1 KIPRIS 연동
- 데이터에 `patKiprisLink` 필드가 이미 존재. URL 패턴 예: `http://kpat.kipris.or.kr/...`
- 프론트엔드에서 `<a href={patKiprisLink} target="_blank" rel="noopener noreferrer">KIPRIS 원문 보기</a>` 패턴
- 매물 상세·매물 리스트 카드에서 모두 노출
- URL이 없거나 깨진 경우 출원번호로 KIPRIS 표준 deeplink (`https://doi.org/10.8080/<patApplicationNumber>`) 폴백

---

## 7. 기술 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: Next.js 14 (App Router) + TypeScript +       │
│  Tailwind CSS + shadcn/ui                               │
│                                                          │
│  Pages: /, /market, /patent/[appNo], /chat, /apply      │
└──────────────────────┬──────────────────────────────────┘
                       │ Server Actions / API Routes
┌──────────────────────▼──────────────────────────────────┐
│  Backend: Next.js API Routes (Vercel Serverless)        │
│  - /api/search    : 매물 검색·필터·페이지네이션          │
│  - /api/match     : 매수 후보 기업 매칭 (룰베이스)        │
│  - /api/chat      : (stretch) AI 코파일럿                │
│  - /api/loi       : 거래 신청 폼 저장                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Data: Supabase (PostgreSQL)                            │
│  - patents      : 매물 풀 ~10만 행 (필수 필드만)          │
│  - companies    : 매수 후보 기업 시드 30~50              │
│  - ipc_company  : IPC ↔ 기업 매핑                        │
│  - applications : LOI 거래 신청                          │
│  Full-text search: tsvector (Korean parser 또는 trigram)│
└─────────────────────────────────────────────────────────┘

[로컬 ETL] Python 스크립트
- patents.csv (728MB) → 매물 풀 추출 → Supabase 적재
- legalStatus.csv (1.8GB) → 출원번호별 최신 status → patents 테이블에 join
- transfers.csv (156MB) → 이전 이력 카운트 → patents 테이블에 join
- 정출연/대학 분류 룰 적용 → `org_type` 필드 신설
- 긴급도 태그 룰 적용 → `urgency` 필드 신설

[CI/CD] GitHub Actions
- main push → Vercel auto deploy
- (선택) Supabase 마이그레이션 자동 실행
```

### 7.1 무료 한도 안에 들어오는 확인
| 리소스 | 한도 | 우리 예측 | 여유 |
|---|---|---|---|
| Supabase DB | 500 MB | 매물 10만행 × ~500B = 50MB | 90% 여유 |
| Vercel 대역폭 | 100 GB/월 | 대회 기간 <1GB 예상 | 99% 여유 |
| Vercel 함수 실행 | 100 GB-hr | 데모 트래픽 <1 GB-hr | 99% 여유 |
| OpenAI API (stretch) | — | 月 $5~10 예산 | 별도 |

---

## 8. 데이터 파이프라인 디테일

### 8.1 ETL 스크립트 구성
```
scripts/
├── 01_extract_patents_pool.py
│   입력: Data/patents.csv
│   출력: build/patents_pool.csv (매물 풀 ~10만 행)
│   처리: 매물 풀 조건 적용 + 정출연/대학 재분류 + 긴급도 태그
├── 02_merge_legal_status.py
│   입력: build/patents_pool.csv + Data/legalStatus.csv
│   출력: build/patents_with_status.csv
│   처리: 출원번호별 최신 legalStatus만 left join
├── 03_merge_transfers.py
│   처리: transfers 카운트·최근 이전 이력 join
├── 04_load_to_supabase.py
│   처리: COPY 또는 batch insert로 Supabase 적재
└── 05_build_company_seed.py
    처리: 매수 후보 기업 시드 CSV → companies + ipc_company 적재
```

### 8.2 적재 필드 (최소 18개)
| 필드 | 출처 | 비고 |
|---|---|---|
| application_number | patApplicationNumber | PK |
| title | patTitle | |
| applicant | patApplicant | |
| university_name | patUniversityName | |
| org_type | 분류 룰 | UNIV / GRI / OTHER |
| application_date | patApplicationDate | |
| registration_date | patRegistrationDate | |
| expiration_date | patExpirationDate | |
| ipc_primary | patIpcNumber (첫 번째) | |
| ipc_all | patIpcNumber | 검색용 array |
| claims_count | patClaimsCount | |
| family_count | patFamilyCount | |
| citation_count | patCitationCount | |
| transfer_count | patTransferCount | |
| legal_status | patLegalStatus (최신) | |
| final_disposal | patFinalDisposal | |
| rnd_department | patRndDepartment | |
| kipris_link | patKiprisLink | |
| urgency | 룰 (🔴/🟡/🟢) | 신설 |
| remaining_years | 룰 (만료일 - 오늘) | 신설 |

청구항 본문·초록은 적재하지 않고 KIPRIS 외부 링크로 위임.

---

## 9. 4주 일정 (5/16 → 6/11)

| 주차 | 기간 | 마일스톤 | 산출물 |
|---|---|---|---|
| W1 | 5/16~5/22 | 데이터 파이프라인 + 랜딩 페이지 + Supabase 구축 | ETL 스크립트 5개, DB 적재 완료, 랜딩 배포 (patentpilot.vercel.app) |
| W2 | 5/23~5/29 | 매물 리스트/상세/거래 신청 + 룰베이스 매칭 | 화면 3개 작동, LOI 폼, KIPRIS 연동 |
| W3 | 5/30~6/5 | 사업계획서·슬라이드·데모영상 1차 + AI 매칭 stretch | 사업계획서 v2, 슬라이드 v2, 영상 raw, (시간 되면) 채팅봇 |
| W4 | 6/6~6/10 | 외부 피드백 반영 + 폴리싱 + 영상 본녹화 + 6/10 제출 | 제출 완료 (6/11 07:59 마감 반드시) |

### 9.1 W1 상세
- Day 1 (5/16): 본 spec 합의 + writing-plans 실행
- Day 2~3: ETL 스크립트 1~3 (로컬에서 build/ 산출물 생성)
- Day 4: Supabase 프로젝트 생성·스키마 마이그레이션·적재
- Day 5: Next.js 프로젝트 scaffold + Vercel 연결 + GitHub Actions 자동 배포 확인
- Day 6: 랜딩 페이지 디자인 + 라이브 카운터 (Supabase RPC)
- Day 7: W1 회고 + 매수 기업 시드 큐레이션

---

## 10. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 매수 기업 정보 외부 보강 늦어짐 | 매칭 결과 빈약 | 시드 30~50개 수동 큐레이션이 W1 안 끝나면 우선 IPC 적합도만 노출, 기업명은 익명 |
| Supabase 무료 한도 초과 | 서비스 중단 | 적재 행수 모니터링, 필요시 매물 풀 더 좁힘 (5만건 이하) |
| KIPRIS deeplink 깨짐 | 원문 열람 불가 | `patKiprisLink` 우선, 폴백으로 doi.org/10.8080/<출원번호> 또는 KIPRIS 검색 URL |
| AI 채팅 W3 안에 못 만듦 | stretch 미달 | 데모 영상에 시나리오 녹화로 대체, 본 평가는 매물 검색·매칭으로 |
| 데이터 ETL 시간 폭증 (728MB+1.8GB) | W1 지연 | 매물 풀 미리 필터해서 ETL 처리 양 90% 축소, 청크 처리 |
| 정출연/대학 분류 오류 | 통계 신뢰도 | 키워드 기반 + 수동 검수 Top 50 기관, 신뢰도 점수 함께 노출 |
| 대회 시제품 가점 못 받음 | 대회 점수 | W2 종료 시점에 최소 매물 리스트 + 상세는 무조건 작동 |

---

## 11. 미해결 사항 (W1 안에 결정)

- [ ] 매수 후보 기업 시드 30~50개 최종 리스트 (W1 Day 7)
- [ ] IPC ↔ 기업 매핑 가중치 표 (W1 Day 7)
- [ ] PostgreSQL 한글 풀텍스트 검색: tsvector + Korean parser vs trigram 결정 (W1 Day 4)
- [ ] 거래 신청 LOI 폼 필드 정의 (회사·담당자·관심 매물·예상 거래액·메시지) (W2 Day 1)
- [ ] 사업계획서 본문 작성자 분담 (W2 Day 5)
- [ ] 데모 영상 시나리오 1개 풀 스크립트 (박상훈이 매물 발견 → 매칭 확인 → LOI 신청) (W3 Day 1)

---

## 12. 기존 TreeO 기획서와의 관계

| 항목 | TreeO 기획서 v1 | PatentPilot (본 문서) |
|---|---|---|
| 범위 | 인프라(Foundation) + 4개 제품(Product) | K-R&D Patent Match 단일 + 유지비 시그널 강조 |
| 페르소나 | 5명 | 2명 (매도/매수) |
| BM | Open Core (오픈소스 + B2B SaaS) | 매칭 수수료 + LOI 과금 |
| 데이터 모델 | 그래프 DB (Neo4j/SPARQL) | PostgreSQL (그래프는 Phase 2) |
| AI | RAG on Graph | 룰베이스 + 임베딩 (stretch) |
| 시제품 | 정적 mockup OK | 작동하는 검색·매칭·LOI |
| 대회 메시지 | "한국판 PatentsView" | "잠든 R&D 특허를 깨우는 코파일럿" |

**관계**: PatentPilot은 TreeO 비전의 첫 제품 단계. 대회 통과 후 Foundation(TreeO Graph) 단계로 확장 가능. 사업계획서에는 "PatentPilot → TreeO Platform" 로드맵으로 통합 서술.

---

## 13. 다음 단계

본 spec 사용자 승인 → `superpowers:writing-plans` skill 호출하여 구현 계획(단계별 태스크 분해 + 검증 기준) 작성.
