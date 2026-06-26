---
title: "Zotero <-> iCloud 연동"
status: Draft
published: 2026-06-27
tags:
source: https://jyyun1209.tistory.com/27
---

<mark><strong>※Zotero와 iCloud를 연동하기 위해서는 <span style="color:#E74C3C;">Zotero6</span>를 설치해야 한다.</strong></mark>

# Zotero6 설치
## 1. Zotero 홈페이지([https://www.zotero.org](https://www.zotero.org)) 접속

![[Manual/zotero-icloud-연동/image-1.png]]
*▲ 홈페이지 가운데 Download 버튼을 누른다*

## 2. 본인의 환경에 맞는 Zotero6 다운로드

![[Manual/zotero-icloud-연동/image-2.png]]
*▲ 오른쪽 아래의 화살표를 누르면 Zotero6를 다운로드 받을 수 있다*

# Zotfile 설치
## 1. Zotfile 홈페이지([http://zotfile.com](http://zotfile.com)) 접속

![[Manual/zotero-icloud-연동/image-3.png]]
*▲ 홈페이지 왼쪽의 Download 클릭*

## 2. Zotfile 설치

<strong>A. Zotero에서 Add-ons Manager 실행 (Zotero 실행 > 도구 (Tools) > 확장기능 (Add-ons))</strong>
![[Manual/zotero-icloud-연동/image-4.png]]
*▲ Zotero > 도구 (Tools) > 확장기능 (Add-ons)*
  
<strong>B. Add-ons Manager에서 Zotfile 설치 (우측 상단 톱니바퀴 > install Add-on From File)</strong>
![[Manual/zotero-icloud-연동/image-5.png]]
*▲ 1. “Install Add-on From File”을 누르고,*

![[Manual/zotero-icloud-연동/image-6.png]]
*▲ 2. 아까 다운받은 zotfile(xpi)을 선택하면*

![[Manual/zotero-icloud-연동/image-7.png]]
*▲ 3. “Install Now”를 클릭하여 설치를 시작할 수 있다.*

<strong>C. Zotero 재실행</strong>
![[Manual/zotero-icloud-연동/image-8.png]]
*▲ “Restart now”를 클릭하여 Zotero를 재실행한다.*

# Zotero 설정
## 1. Zotero에서 환경 설정 열기 (편집 > 환경 설정)

![[Manual/zotero-icloud-연동/image-9.png]]

## 2. Zotero 계정 로그인 (환경설정 > 동기화)

환경 설정의 동기화 탭에서 Zotero 계정에 로그인한다. (계정은 조테로 홈페이지에서 생성)  
  

## 3. 동기화 끄기 (Off)

여기서의 파일 동기화는 Zotero 저장소와의 동기화를 의미한다. 우리는 iCloud와 연동할 것이기 때문에 Zotero 저장소와의 파일 동기화는 꺼준다.

![[Manual/zotero-icloud-연동/image-10.png]]
*▲ Zotero 환경 설정에서 파일 동기화를 모두 꺼준다.*

## 4. 서지 정보 저장될 위치 설정

“Zoteo 환경 설정 > 고급 > 파일 및 폴더 > 저장 위치”는 Zotero 라이브러리에 저장된 서지 정보가 저장되는 곳이다. (실제 논문이 저장되는 위치는 아님. 기본으로 지정돼 있는 위치를 그대로 사용해도 됨.)

![[Manual/zotero-icloud-연동/image-11.png]]

# Zotfile 설정
## 1. Zotfile 환경 설정 열기

Zotfile이 제대로 설치됐다면, “도구” 탭에 Zotfile Preference가 생긴다.

![[Manual/zotero-icloud-연동/image-12.png]]
*▲ Zotero > 도구 > Zotfile Preference*

## 2. 실제 파일 저장 위치 설정

실제 파일의 저장 위치를 iCloud 폴더의 경로(iCloud에서 논문 pdf 파일을 실제로 저장하고 있을 위치)로 지정해준다.

![[Manual/zotero-icloud-연동/image-13.png]]
*▲ General Settings > Location of Files > Custom Location을 iCloud 폴더 위치로 지정한다.*

추가로, 설정이 필수는 아니지만 “Renaming Rules”에서 이름 변경 규칙을 설정해놓으면, 파일 저장 시 본인이 선호하는 방식으로 자동으로 이름을 변경하여 저장해준다.
