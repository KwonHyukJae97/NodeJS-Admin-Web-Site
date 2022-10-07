/**
 * 시간 관련 반복적으로 사용되는 메서드 목록
 */

// 오늘 날짜 구하는 메서드
export function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (1 + date.getMonth())).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return year + '-' + month + '-' + day;
}

// 현재 시각 구하는 메서드
export function getTime() {
  const date = new Date();
  const hours = ('0' + date.getHours()).slice(-2);
  const min = ('0' + date.getMinutes()).slice(-2);
  const sec = ('0' + date.getSeconds()).slice(-2);
  const ms = ('0' + date.getMilliseconds()).slice(-2);

  return hours + min + sec + ms;
}

// 한국 시간으로 변경하는 메서드
export const getDateTime = (utcTime) => {
  utcTime.setHours(utcTime.getHours() + 9);
  return utcTime.toISOString().replace('T', ' ').substring(0, 16);
};
