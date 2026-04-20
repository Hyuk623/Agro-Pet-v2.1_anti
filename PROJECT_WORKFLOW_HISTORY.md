# Agro-Pet-v2.1_anti (다마고치형 딸기 농사 시뮬레이터) 개발 및 작업 기록

## 1. 프로젝트 개요 (Project Overview)
- **목적:** 텍스트가 많고 딱딱했던 기존의 시뮬레이터에서 벗어나, 모바일 환경에 최적화된 "다마고치형" 작물 육성 및 학습 게임 구축.
- **핵심 목표:** 작물(현재 딸기)에게 이름을 지어주고, 애착을 느끼게 하며, 플레이어의 매일의 결정(온도, 습도, 환기, 일조량 등)이 어떤 결과를 가져오는지 시각적/직관적으로 확인할 수 있게 만드는 것.

## 2. 작업 과정 및 개발 내용 (Workflow Session)

### [기본 환경 셋업]
- React + Vite + TypeScript 베이스로 신규 프로젝트 구축.
- TailwindCSS 대신 Vanilla CSS와 Custom Color (Glassmorphism 도입 등)를 활용하여 모바일 최적화 및 귀엽고 세련된 UI 세팅.
- `lucide-react`를 통해 직관적인 환경 대시보드 아이콘 도입.

### [데이터 및 구조 설계 (Data & Architecture)]
- **Game Engine 분리 설계:** UI 코드와 시뮬레이션 계산 관련 로직을 분리하기 위해 `GameContext.tsx` 시스템을 설계. 
- **Crop Pack 시스템 (`src/data/strawberryPack.ts`):** 이후 다른 작물을 쉽게 추가할 수 있도록 규칙(Rule), 환경 선호도, 액션에 따른 상성, 패널티, 죽음(Death)에 대한 정의들을 모듈화시켜 구성.
- **Environment Generator (`src/data/environmentGen.ts`):** 일차(Day)에 따라 변화하는 환경 변수를 생성하는 로직 추가. 추후 실제 날씨 데이터나 계절 API와 연동하기 용이하게 뼈대 작성.

### [컴포넌트 구현 사항 (Components & UI)]
1. **오늘의 환경 (EnvironmentBoard.tsx):** 문장을 읽을 필요 없이, 온도계, 햇빛, 특별한 경고 아이콘 등으로 3초 안에 오늘의 상태 파악이 가능하도록 UI 변경.
2. **비주얼 작물창 (CropVisual.tsx):** 현재 상태(씨앗, 성장기, 개화, 결실 등)와 스트레스, 질병 상태(Healthy, Stressed, Risky 등)에 따라 이모지와 색상으로 직관적 변화 반영.
3. **내부 상태 게이지 (StatusPanel.tsx):** 수분, 스트레스, 체력(Stamina), 성장 진행도의 변화를 프로그레스 바 형태로 시각화.
4. **일일 돌보기 시스템 (ActionControls.tsx):** 관수, 난방, 환기, 조명을 Level (low/normal/high) 조작으로 구성하여 실제 복잡한 조작을 간소화. 게임적인 선택을 부여함.

### [학습 및 페널티/보상 시스템 (Core Logic)]
- **죽음(Death)과 피드백 시스템:** 무작정 죽는 것이 아니라, 왜 죽었는가를 정확히 짚어주는 "주요 원인", "세부 원인", "학습 노트(교훈)"를 제공하는 피드백 모달 (`GameModals.tsx - DeathModal`) 구현.
- **체크포인트(Checkpoint) & 토큰(Token):** 
  - 특정 위험 순간 전에 자동으로 세이브포인트를 저장.
  - 플레이어가 생존/성장/미니게임을 통해 얻은 Token을 2개 사용하여 돌아갈 수 있게 하는 구제 시스템 마련.
- **아이템(Item):** 수분&성장 촉진제가 되는 '영양제'와 하루 동안 추위를 방어해주는 '방한덮개' 구현.
- **미니게임 (MinigameModal):** 특정 일차에 환경 관련 퀴즈를 맞추면 토큰을 지급하도록 설계시켜 학습과 게임을 결합.

## 3. 이후 계획 (Future Roadmap)
- [ ] 현재는 `window.reload()` 레벨의 프로토타입 리셋이므로, 실제 로컬스토리지 또는 Supabase 기반의 상태 저장 로직 추가.
- [ ] **Firebase 배포 진행 (예정):** Firebase Hosting을 통한 웹 플랫폼 배포 작업.
- [x] Github Repository (`https://github.com/Hyuk623/Agro-Pet-v2.1_anti`) 에 초기 환경 및 구조 정리본 Push 완료.
